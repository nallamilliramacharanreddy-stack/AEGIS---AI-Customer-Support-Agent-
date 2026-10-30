import uuid
import json
from datetime import datetime
from typing import Dict, List, Optional, Any

from database import get_connection
from nlu_engine import (
    validate_and_sanitize_input,
    detect_language,
    detect_intent,
    extract_entities,
    analyze_sentiment_and_urgency
)
from decision_engine import (
    get_or_create_session,
    run_decision_engine,
    OrderService,
    KnowledgeService,
    TicketService
)

def process_customer_message(
    conversation_id: str,
    message: str,
    customer_id: str = "CUST-104",
    language: Optional[str] = None
) -> Dict[str, Any]:
    now = datetime.now().isoformat()
    conn = get_connection()
    c = conn.cursor()

    # Ensure conversation row exists in DB
    c.execute("SELECT * FROM conversations WHERE conversation_id = ?", (conversation_id,))
    conv_row = c.fetchone()
    if not conv_row:
        c.execute("""
        INSERT INTO conversations (conversation_id, customer_id, status, language, priority, sentiment, urgency, created_at, updated_at)
        VALUES (?, ?, 'ACTIVE', 'en', 'P3 - Medium', 'Neutral', 'NORMAL', ?, ?)
        """, (conversation_id, customer_id, now, now))
        conn.commit()

    # ==========================================================
    # 1. INPUT VALIDATION & SECURITY DEFENSE
    # ==========================================================
    validation = validate_and_sanitize_input(message)
    if not validation["valid"]:
        error_code = validation["error_code"]
        err_msg = validation["message"]

        # Log security audit if applicable
        c.execute("""
        INSERT INTO audit_logs (log_id, timestamp, event_type, conversation_id, details_json)
        VALUES (?, ?, 'SECURITY_ALERT', ?, ?)
        """, (f"LOG-{uuid.uuid4().hex[:8]}", now, conversation_id, json.dumps({
            "error_code": error_code,
            "raw_message": message
        })))
        conn.commit()
        conn.close()

        return {
            "success": False,
            "error_code": error_code,
            "message": err_msg,
            "state": "ERROR",
            "conversation_id": conversation_id,
            "response": err_msg,
            "requires_human": False
        }

    clean_message = validation["sanitized_text"]

    # ==========================================================
    # 2. LANGUAGE DETECTION
    # ==========================================================
    lang_info = detect_language(clean_message)
    if language:
        lang_info["user_specified_language"] = language

    # ==========================================================
    # 3. SESSION CONTEXT MANAGEMENT
    # ==========================================================
    session = get_or_create_session(conversation_id, customer_id)
    session["turn_count"] += 1

    # Record incoming customer message in DB
    user_msg_id = f"MSG-{uuid.uuid4().hex[:8]}"
    c.execute("""
    INSERT INTO messages (message_id, conversation_id, sender_type, message, timestamp)
    VALUES (?, ?, 'CUSTOMER', ?, ?)
    """, (user_msg_id, conversation_id, clean_message, now))
    conn.commit()

    # Check if human agent currently has active control
    c.execute("SELECT status, assigned_agent FROM conversations WHERE conversation_id = ?", (conversation_id,))
    latest_conv = c.fetchone()
    if latest_conv and latest_conv["status"] in ["HUMAN_AGENT_ACTIVE", "ESCALATED"]:
        # Do not allow AI to speak over human agent!
        conn.close()
        return {
            "success": True,
            "conversation_id": conversation_id,
            "message_id": user_msg_id,
            "state": "HUMAN_AGENT_ACTIVE",
            "response": "Your message has been delivered directly to your assigned human support agent, who will reply shortly.",
            "human_status": "ACTIVE",
            "ai_status": "PAUSED",
            "assigned_agent": latest_conv["assigned_agent"],
            "requires_human": True,
            "intent": "HUMAN_AGENT_ACTIVE",
            "confidence": 1.0,
            "confidence_level": "HIGH"
        }

    # ==========================================================
    # 4. INTENT DETECTION
    # ==========================================================
    intent_data = detect_intent(clean_message)

    # ==========================================================
    # 5. ENTITY EXTRACTION
    # ==========================================================
    entities = extract_entities(clean_message)

    # ==========================================================
    # 6. SENTIMENT & URGENCY ANALYSIS
    # ==========================================================
    sentiment_data = analyze_sentiment_and_urgency(clean_message, intent_data["intent"])

    # Update customer message record with NLU attributes
    c.execute("""
    UPDATE messages
    SET intent = ?, entities_json = ?, sentiment = ?, urgency = ?, confidence = ?
    WHERE message_id = ?
    """, (
        intent_data["intent"],
        json.dumps(entities),
        sentiment_data["sentiment"],
        sentiment_data["urgency"],
        intent_data["confidence"],
        user_msg_id
    ))
    conn.commit()

    # ==========================================================
    # 7. DECISION ENGINE EXECUTION
    # ==========================================================
    decision = run_decision_engine(
        session=session,
        user_message=clean_message,
        intent_data=intent_data,
        entities=entities,
        sentiment_data=sentiment_data,
        language_data=lang_info
    )

    # Optional conversational enhancement with Gemini if configured
    model_name = "Aegis Hybrid NLU + Decision Engine"
    try:
        from gemini_service import GeminiService
        if GeminiService.is_configured() and decision.get("state") in ["ANSWERED", "ACTION_REQUIRED", "CLARIFICATION_REQUIRED", "TICKET_CREATED"]:
            target_lang = lang_info.get("user_specified_language") or lang_info.get("detected_language") or "en"
            enhanced = GeminiService.enhance_chat_response(
                user_message=clean_message,
                grounded_facts=decision["response"],
                customer_name="Elena",
                conversation_context=session.get("history", []),
                language=target_lang
            )
            if enhanced and len(enhanced) > 5:
                decision["response"] = enhanced
                model_name = f"Gemini {GeminiService.get_model()} (Grounded Hybrid)"
    except Exception:
        pass

    ai_response_text = decision["response"]
    final_state = decision["state"]
    requires_human = decision["requires_human"]
    ticket_info = decision.get("ticket")
    order_info = decision.get("order")
    grounded_sources = decision.get("grounded_sources", [])

    # Record AI Response in DB
    ai_msg_id = f"MSG-{uuid.uuid4().hex[:8]}"
    resp_id = f"RESP-{uuid.uuid4().hex[:8]}"
    ai_now = datetime.now().isoformat()

    c.execute("""
    INSERT INTO messages (message_id, conversation_id, sender_type, message, intent, entities_json, sentiment, urgency, confidence, timestamp)
    VALUES (?, ?, 'AI_AGENT', ?, ?, ?, ?, ?, ?, ?)
    """, (
        ai_msg_id,
        conversation_id,
        ai_response_text,
        decision["intent"],
        json.dumps(decision["entities"]),
        sentiment_data["sentiment"],
        sentiment_data["urgency"],
        decision["confidence"],
        ai_now
    ))

    c.execute("""
    INSERT INTO ai_responses (response_id, message_id, conversation_id, model_name, model_version, retrieval_score, confidence, response, requires_human, grounded_sources_json, created_at)
    VALUES (?, ?, ?, ?, 'v2.6', ?, ?, ?, ?, ?, ?)
    """, (
        resp_id,
        ai_msg_id,
        conversation_id,
        model_name,
        decision["confidence"],
        decision["confidence"],
        ai_response_text,
        1 if requires_human else 0,
        json.dumps(grounded_sources),
        ai_now
    ))

    # Update Conversation status & attributes
    conv_status = "ESCALATED" if requires_human else ("WAITING_FOR_CUSTOMER" if final_state == "CLARIFICATION_REQUIRED" else "ACTIVE")
    assigned_agent = ticket_info["assigned_agent"] if ticket_info else None

    c.execute("""
    UPDATE conversations
    SET status = ?, language = ?, intent = ?, priority = ?, sentiment = ?, urgency = ?, assigned_agent = COALESCE(?, assigned_agent), updated_at = ?
    WHERE conversation_id = ?
    """, (
        conv_status,
        lang_info["detected_language"],
        decision["intent"],
        sentiment_data["priority"],
        sentiment_data["sentiment"],
        sentiment_data["urgency"],
        assigned_agent,
        ai_now,
        conversation_id
    ))

    conn.commit()
    conn.close()

    # Append to session history
    session["history"].append({
        "role": "user",
        "message": clean_message,
        "timestamp": now
    })
    session["history"].append({
        "role": "agent",
        "message": ai_response_text,
        "timestamp": ai_now
    })

    return {
        "success": True,
        "conversation_id": conversation_id,
        "customer_id": customer_id,
        "message_id": ai_msg_id,
        "response": ai_response_text,
        "state": final_state,
        "intent": decision["intent"],
        "confidence": decision["confidence"],
        "confidence_level": decision["confidence_level"],
        "entities": decision["entities"],
        "sentiment": sentiment_data["sentiment"],
        "sentiment_score": sentiment_data["sentiment_score"],
        "urgency": sentiment_data["urgency"],
        "priority": sentiment_data["priority"],
        "requires_human": requires_human,
        "human_status": "ACTIVE" if requires_human else "STANDBY",
        "ai_status": "PAUSED" if requires_human else "AVAILABLE",
        "language": lang_info,
        "ticket": ticket_info,
        "order": order_info,
        "grounded_sources": grounded_sources,
        "timestamp": ai_now
    }
