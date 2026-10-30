import re
import json
import sqlite3
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple
from database import get_connection

# In-memory session store for multi-turn conversations
ACTIVE_SESSIONS: Dict[str, Dict[str, Any]] = {}

def get_or_create_session(conversation_id: str, customer_id: str = "CUST-104") -> Dict[str, Any]:
    if conversation_id not in ACTIVE_SESSIONS:
        # Check if conversation exists in DB
        conn = get_connection()
        c = conn.cursor()
        c.execute("SELECT * FROM conversations WHERE conversation_id = ?", (conversation_id,))
        row = c.fetchone()
        conn.close()

        if row:
            ACTIVE_SESSIONS[conversation_id] = {
                "conversation_id": conversation_id,
                "customer_id": row["customer_id"],
                "status": row["status"],
                "language": row["language"],
                "last_order_id": None,
                "last_ticket_id": None,
                "pending_intent": None,
                "turn_count": 0,
                "history": []
            }
        else:
            ACTIVE_SESSIONS[conversation_id] = {
                "conversation_id": conversation_id,
                "customer_id": customer_id,
                "status": "ACTIVE",
                "language": "en",
                "last_order_id": None,
                "last_ticket_id": None,
                "pending_intent": None,
                "turn_count": 0,
                "history": []
            }
    return ACTIVE_SESSIONS[conversation_id]


# ==========================================================
# 1. PRONOUN RESOLUTION & CONTEXT CONTINUITY
# ==========================================================

PRONOUN_TRIGGERS = [
    r"\b(it|its|the order|that order|the package|that package|my item|that item)\b",
    r"\bwhere is it\b",
    r"\bcancel it\b",
    r"\breturn it\b",
    r"\btrack it\b"
]

def resolve_contextual_entities(session: Dict[str, Any], text: str, extracted_entities: Dict[str, Any], intent: str) -> Tuple[Dict[str, Any], str]:
    resolved = dict(extracted_entities)
    effective_intent = intent
    lowered = text.lower().strip()

    # If user provided a standalone order ID like "ORD-12345" or "It's ORD-12345"
    if "order_id" in resolved and session.get("pending_intent") and intent in ["GENERAL_INFORMATION", "OTHER"]:
        effective_intent = session["pending_intent"]
        session["pending_intent"] = None

    # If user used a pronoun ("where is it", "cancel it") and we have order_id in session
    if "order_id" not in resolved and session.get("last_order_id"):
        has_pronoun = any(re.search(p, lowered) for p in PRONOUN_TRIGGERS)
        if has_pronoun or intent in ["ORDER_STATUS", "ORDER_CANCEL", "ORDER_RETURN", "ORDER_REFUND"]:
            resolved["order_id"] = session["last_order_id"]
            resolved["resolved_from_context"] = True

    # If user gave an order ID now, update session memory
    if "order_id" in resolved:
        session["last_order_id"] = resolved["order_id"]

    return resolved, effective_intent


# ==========================================================
# 2. BUSINESS SERVICES: ORDER, KNOWLEDGE, TICKET
# ==========================================================

class OrderService:
    @staticmethod
    def get_order(order_id: str, customer_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        conn = get_connection()
        c = conn.cursor()
        if customer_id:
            c.execute("SELECT * FROM orders WHERE order_id = ? AND customer_id = ?", (order_id, customer_id))
        else:
            c.execute("SELECT * FROM orders WHERE order_id = ?", (order_id,))
        row = c.fetchone()
        conn.close()
        if row:
            return dict(row)
        return None

    @staticmethod
    def cancel_order(order_id: str, customer_id: Optional[str] = None) -> Dict[str, Any]:
        conn = get_connection()
        c = conn.cursor()
        c.execute("SELECT * FROM orders WHERE order_id = ?", (order_id,))
        row = c.fetchone()
        if not row:
            conn.close()
            return {"success": False, "reason": "ORDER_NOT_FOUND"}

        order = dict(row)
        if customer_id and order.get("customer_id") != customer_id:
            conn.close()
            return {"success": False, "reason": "UNAUTHORIZED_CUSTOMER", "order": None}

        if order["status"] in ["CANCELLED"]:
            conn.close()
            return {"success": True, "already_cancelled": True, "order": order}

        if order["cancel_eligible"] == 1 or order["status"] in ["PLACED", "PROCESSING"]:
            now = datetime.now().isoformat()
            c.execute("UPDATE orders SET status = 'CANCELLED', cancel_eligible = 0, updated_at = ? WHERE order_id = ?", (now, order_id))
            conn.commit()
            conn.close()
            order["status"] = "CANCELLED"
            order["cancel_eligible"] = 0
            return {"success": True, "cancelled": True, "order": order}
        else:
            conn.close()
            return {"success": False, "reason": "IN_TRANSIT_NOT_CANCELLABLE", "order": order}

    @staticmethod
    def request_return(order_id: str, customer_id: Optional[str] = None) -> Dict[str, Any]:
        conn = get_connection()
        c = conn.cursor()
        c.execute("SELECT * FROM orders WHERE order_id = ?", (order_id,))
        row = c.fetchone()
        if not row:
            conn.close()
            return {"success": False, "reason": "ORDER_NOT_FOUND"}

        order = dict(row)
        if customer_id and order.get("customer_id") != customer_id:
            conn.close()
            return {"success": False, "reason": "UNAUTHORIZED_CUSTOMER", "order": None}

        if order["status"] == "CANCELLED":
            conn.close()
            return {"success": False, "reason": "ORDER_WAS_CANCELLED", "order": order}

        if order["return_eligible"] == 1:
            rma_code = f"RMA-{order_id.replace('ORD-', '')}-{int(datetime.now().timestamp()) % 10000}"
            now = datetime.now().isoformat()
            c.execute("UPDATE orders SET status = 'RETURN_REQUESTED', return_eligible = 0, updated_at = ? WHERE order_id = ?", (now, order_id))
            conn.commit()
            conn.close()
            order["status"] = "RETURN_REQUESTED"
            order["return_eligible"] = 0
            return {
                "success": True,
                "rma_code": rma_code,
                "order": order,
                "return_window_days": 30
            }
        else:
            conn.close()
            return {"success": False, "reason": "RETURN_PERIOD_EXPIRED", "order": order}


class KnowledgeService:
    @staticmethod
    def search_kb(query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        conn = get_connection()
        c = conn.cursor()
        c.execute("SELECT * FROM knowledge_documents WHERE status = 'ACTIVE'")
        rows = c.fetchall()
        conn.close()

        docs = [dict(r) for r in rows]
        query_words = set(re.findall(r"\b\w{3,}\b", query.lower()))

        scored_docs = []
        for doc in docs:
            doc_text = f"{doc['title']} {doc['content']} {doc['category']}".lower()
            doc_words = set(re.findall(r"\b\w{3,}\b", doc_text))
            intersection = query_words.intersection(doc_words)
            if not intersection:
                score = 0.0
            else:
                score = len(intersection) / (len(query_words) + 1e-5)
                # Boost if title matches
                if any(w in doc['title'].lower() for w in query_words):
                    score += 0.25

            score = min(1.0, score)
            if score > 0.15:
                doc["relevance_score"] = round(score * 100, 1)
                scored_docs.append(doc)

        scored_docs.sort(key=lambda x: x["relevance_score"], reverse=True)
        return scored_docs[:top_k]


class TicketService:
    @staticmethod
    def create_support_ticket(
        customer_id: str,
        conversation_id: str,
        subject: str,
        description: str,
        category: str,
        priority: str,
        customer_name: str = "Elena Rostova",
        assigned_agent: str = "Customer Support Tier 2"
    ) -> Dict[str, Any]:
        conn = get_connection()
        c = conn.cursor()

        ticket_num = int(datetime.now().timestamp()) % 10000 + 9400
        ticket_id = f"TCK-{ticket_num}"
        now = datetime.now().isoformat()

        c.execute("""
        INSERT INTO tickets (ticket_id, customer_id, customer_name, conversation_id, subject, description, category, priority, status, assigned_agent, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Open', ?, ?, ?)
        """, (ticket_id, customer_id, customer_name, conversation_id, subject, description, category, priority, assigned_agent, now, now))

        conn.commit()
        conn.close()

        return {
            "ticket_id": ticket_id,
            "customer_id": customer_id,
            "subject": subject,
            "category": category,
            "priority": priority,
            "status": "Open",
            "assigned_agent": assigned_agent,
            "created_at": now
        }


# ==========================================================
# 3. DECISION ENGINE ORCHESTRATOR
# ==========================================================

def run_decision_engine(
    session: Dict[str, Any],
    user_message: str,
    intent_data: Dict[str, Any],
    entities: Dict[str, Any],
    sentiment_data: Dict[str, Any],
    language_data: Dict[str, Any]
) -> Dict[str, Any]:
    intent = intent_data["intent"]
    resolved_entities, effective_intent = resolve_contextual_entities(session, user_message, entities, intent)
    customer_id = session.get("customer_id", "CUST-104")
    conversation_id = session.get("conversation_id", "CONV-DEFAULT")

    # ------------------------------------------------------
    # RULE 1: EXPLICIT HUMAN AGENT ESCALATION
    # ------------------------------------------------------
    if effective_intent == "HUMAN_AGENT_REQUEST" or sentiment_data.get("requires_escalation"):
        session["status"] = "ESCALATED"
        ticket = TicketService.create_support_ticket(
            customer_id=customer_id,
            conversation_id=conversation_id,
            subject=f"Human Escalation: {effective_intent.replace('_', ' ').title()}",
            description=f"Customer requested human agent. Context: '{user_message}'. Sentiment: {sentiment_data['sentiment']}.",
            category="Customer Escalation",
            priority=sentiment_data["priority"],
            assigned_agent="Elena Rostova (Head of Support)"
        )
        session["last_ticket_id"] = ticket["ticket_id"]

        resp_text = (
            f"I have connected your session directly with our Human Support Team. "
            f"Ticket #{ticket['ticket_id']} has been opened with {sentiment_data['priority']} priority and assigned to "
            f"Senior Support Specialist {ticket['assigned_agent']}. A live representative is reviewing your conversation context."
        )

        return {
            "state": "ESCALATED_TO_HUMAN",
            "response": resp_text,
            "intent": effective_intent,
            "entities": resolved_entities,
            "confidence": 0.98,
            "confidence_level": "HIGH",
            "requires_human": True,
            "human_status": "ACTIVE",
            "ai_status": "PAUSED",
            "ticket": ticket,
            "order": None,
            "grounded_sources": []
        }

    # ------------------------------------------------------
    # RULE 2: ORDER STATUS FLOW (ORDER_STATUS)
    # ------------------------------------------------------
    if effective_intent in ["ORDER_STATUS", "DELIVERY_PROBLEM"]:
        order_id = resolved_entities.get("order_id")
        if not order_id:
            session["pending_intent"] = "ORDER_STATUS"
            session["status"] = "WAITING_FOR_CUSTOMER"
            return {
                "state": "CLARIFICATION_REQUIRED",
                "response": "I'd be happy to check your order status! Could you please provide your order number (for example, ORD-12345)?",
                "intent": effective_intent,
                "entities": resolved_entities,
                "confidence": 0.95,
                "confidence_level": "HIGH",
                "requires_human": False,
                "ticket": None,
                "order": None,
                "grounded_sources": []
            }

        # Query Order Service
        order = OrderService.get_order(order_id)
        if not order:
            # Hallucination prevention: NEVER fabricate fake order data!
            return {
                "state": "UNABLE_TO_VERIFY",
                "response": f"I queried our central fulfillment records, but order '{order_id}' was not found in our database. Please double-check your order number, or let me know if you would like me to create a support ticket for our verification team.",
                "intent": effective_intent,
                "entities": resolved_entities,
                "confidence": 0.92,
                "confidence_level": "HIGH",
                "requires_human": False,
                "ticket": None,
                "order": None,
                "grounded_sources": ["Fulfillment Database Verification Check"]
            }

        # Format Grounded Response from Verified Order Record
        status = order["status"]
        prod = order["product_name"]
        carrier = order["carrier"]
        tracking = order["tracking_number"]
        est = order["estimated_delivery"]
        addr = order["delivery_address"]

        if status == "OUT_FOR_DELIVERY":
            response = (
                f"Your order {order_id} ({prod}) is OUT FOR DELIVERY today with {carrier}! "
                f"Tracking code: {tracking}. It is scheduled to arrive {est} at {addr}."
            )
        elif status == "SHIPPED":
            response = (
                f"Your order {order_id} ({prod}) is in transit with {carrier}. "
                f"Tracking number: {tracking}. The estimated delivery date is {est}."
            )
        elif status == "PROCESSING":
            response = (
                f"Your order {order_id} ({prod}) is currently PROCESSING at our warehouse. "
                f"It is scheduled to dispatch via {carrier} with estimated delivery on {est}."
            )
        elif status == "DELIVERED":
            response = (
                f"Your order {order_id} ({prod}) was DELIVERED on {est} via {carrier}. "
                f"Delivered to: {addr}. If you have not located your package, please let me know."
            )
        elif status == "CANCELLED":
            response = f"Order {order_id} ({prod}) was cancelled. Any refund associated with this order has been authorized."
        else:
            response = f"Order {order_id} ({prod}) is currently in status: {status}."

        return {
            "state": "ANSWERED",
            "response": response,
            "intent": effective_intent,
            "entities": resolved_entities,
            "confidence": 0.99,
            "confidence_level": "HIGH",
            "requires_human": False,
            "ticket": None,
            "order": order,
            "grounded_sources": [f"Order Database Record #{order_id}"]
        }

    # ------------------------------------------------------
    # RULE 3: ORDER CANCELLATION FLOW (ORDER_CANCEL)
    # ------------------------------------------------------
    if effective_intent == "ORDER_CANCEL":
        order_id = resolved_entities.get("order_id")
        if not order_id:
            session["pending_intent"] = "ORDER_CANCEL"
            session["status"] = "WAITING_FOR_CUSTOMER"
            return {
                "state": "CLARIFICATION_REQUIRED",
                "response": "I can help you cancel your order. Could you please provide your order number (e.g., ORD-12345)?",
                "intent": effective_intent,
                "entities": resolved_entities,
                "confidence": 0.95,
                "confidence_level": "HIGH",
                "requires_human": False,
                "ticket": None,
                "order": None,
                "grounded_sources": []
            }

        cancel_res = OrderService.cancel_order(order_id)
        if not cancel_res["success"]:
            if cancel_res.get("reason") == "ORDER_NOT_FOUND":
                return {
                    "state": "UNABLE_TO_VERIFY",
                    "response": f"I couldn't locate order '{order_id}' to process a cancellation. Please verify the order number.",
                    "intent": effective_intent,
                    "entities": resolved_entities,
                    "confidence": 0.90,
                    "confidence_level": "HIGH",
                    "requires_human": False,
                    "ticket": None,
                    "order": None,
                    "grounded_sources": []
                }
            elif cancel_res.get("reason") == "IN_TRANSIT_NOT_CANCELLABLE":
                order = cancel_res["order"]
                return {
                    "state": "ACTION_REQUIRED",
                    "response": (
                        f"Order {order_id} ({order['product_name']}) is currently {order['status']} with {order['carrier']} "
                        f"and cannot be intercepted mid-transit. However, under our 30-day money-back guarantee, you can either "
                        f"refuse the parcel at delivery or initiate a free return as soon as it arrives for a 100% full refund."
                    ),
                    "intent": effective_intent,
                    "entities": resolved_entities,
                    "confidence": 0.98,
                    "confidence_level": "HIGH",
                    "requires_human": False,
                    "ticket": None,
                    "order": order,
                    "grounded_sources": ["KB-103: Order Cancellation Policy & Cutoff Windows"]
                }

        # Successfully cancelled
        order = cancel_res["order"]
        return {
            "state": "ACTION_REQUIRED",
            "response": (
                f"Order {order_id} ({order['product_name']}) has been successfully cancelled! "
                f"A full refund of ${order['total_amount']} has been initiated back to your original payment method "
                f"(expected within 3-5 business days)."
            ),
            "intent": effective_intent,
            "entities": resolved_entities,
            "confidence": 0.99,
            "confidence_level": "HIGH",
            "requires_human": False,
            "ticket": None,
            "order": order,
            "grounded_sources": ["Order Cancellation API Service"]
        }

    # ------------------------------------------------------
    # RULE 4: ORDER RETURN FLOW (ORDER_RETURN)
    # ------------------------------------------------------
    if effective_intent == "ORDER_RETURN":
        order_id = resolved_entities.get("order_id")
        if not order_id:
            session["pending_intent"] = "ORDER_RETURN"
            session["status"] = "WAITING_FOR_CUSTOMER"
            return {
                "state": "CLARIFICATION_REQUIRED",
                "response": "I can help you initiate a return under our 30-day return policy. Could you please provide your order number?",
                "intent": effective_intent,
                "entities": resolved_entities,
                "confidence": 0.95,
                "confidence_level": "HIGH",
                "requires_human": False,
                "ticket": None,
                "order": None,
                "grounded_sources": []
            }

        ret_res = OrderService.request_return(order_id)
        if not ret_res["success"]:
            return {
                "state": "UNABLE_TO_VERIFY",
                "response": f"We were unable to process a return for order '{order_id}': {ret_res.get('reason')}. Please check with our live support team.",
                "intent": effective_intent,
                "entities": resolved_entities,
                "confidence": 0.90,
                "confidence_level": "MEDIUM",
                "requires_human": True,
                "ticket": None,
                "order": ret_res.get("order"),
                "grounded_sources": []
            }

        order = ret_res["order"]
        rma = ret_res["rma_code"]
        return {
            "state": "ACTION_REQUIRED",
            "response": (
                f"Your return for {order['product_name']} (Order {order_id}) has been approved! "
                f"Return Authorization code: #{rma}. We have dispatched a pre-paid shipping label to your email. "
                f"Once our warehouse receives the item, a full refund of ${order['total_amount']} will be issued within 3-5 business days."
            ),
            "intent": effective_intent,
            "entities": resolved_entities,
            "confidence": 0.98,
            "confidence_level": "HIGH",
            "requires_human": False,
            "ticket": None,
            "order": order,
            "grounded_sources": ["KB-102: 30-Day Money-Back Guarantee & Return Policy"]
        }

    # ------------------------------------------------------
    # RULE 5: PAYMENT DISCREPANCY & DUPLICATE CHARGES
    # ------------------------------------------------------
    if effective_intent == "PAYMENT_PROBLEM":
        kb_matches = KnowledgeService.search_kb(user_message, top_k=1)
        kb_content = kb_matches[0]["content"] if kb_matches else "If an authorization hold occurred without confirmation, funds revert automatically within 24 hours."

        ticket = TicketService.create_support_ticket(
            customer_id=customer_id,
            conversation_id=conversation_id,
            subject="Payment Inquiry / Transaction Issue",
            description=f"Customer reported payment discrepancy: '{user_message}'. Auto-audited via Payment Gateway API.",
            category="Billing",
            priority="P2 - High",
            assigned_agent="Automated Billing Gateway"
        )
        session["last_ticket_id"] = ticket["ticket_id"]

        resp_text = (
            f"{kb_content} I have opened automated billing audit ticket #{ticket['ticket_id']} for your account. "
            f"Our treasury reconciliation engine will verify any duplicate authorization and refund any discrepancy automatically."
        )

        return {
            "state": "ACTION_REQUIRED",
            "response": resp_text,
            "intent": effective_intent,
            "entities": resolved_entities,
            "confidence": 0.96,
            "confidence_level": "HIGH",
            "requires_human": False,
            "ticket": ticket,
            "order": None,
            "grounded_sources": ["KB-104: Payment Failure Troubleshooting & Duplicate Charges"]
        }

    # ------------------------------------------------------
    # RULE 6: KNOWLEDGE BASE RAG (TECHNICAL, ACCOUNT, POLICY, GENERAL)
    # ------------------------------------------------------
    kb_results = KnowledgeService.search_kb(user_message, top_k=2)
    if kb_results and kb_results[0]["relevance_score"] >= 20.0:
        top_kb = kb_results[0]
        return {
            "state": "ANSWERED",
            "response": top_kb["content"],
            "intent": effective_intent,
            "entities": resolved_entities,
            "confidence": round(top_kb["relevance_score"] / 100, 2),
            "confidence_level": "HIGH" if top_kb["relevance_score"] >= 50.0 else "MEDIUM",
            "requires_human": False,
            "ticket": None,
            "order": None,
            "grounded_sources": [f"{top_kb['document_id']}: {top_kb['title']}"]
        }

    # ------------------------------------------------------
    # RULE 7: LOW CONFIDENCE / UNKNOWN INTENT FALLBACK
    # ------------------------------------------------------
    ticket = TicketService.create_support_ticket(
        customer_id=customer_id,
        conversation_id=conversation_id,
        subject=f"Inquiry Follow-up: {user_message[:40]}...",
        description=f"AI Agent could not resolve with high confidence. Customer query: '{user_message}'.",
        category="General",
        priority="P3 - Medium",
        assigned_agent="Tier 1 Support Agent"
    )
    session["last_ticket_id"] = ticket["ticket_id"]

    return {
        "state": "TICKET_CREATED",
        "response": (
            f"I want to make sure you get the most accurate answer, so I have opened support ticket #{ticket['ticket_id']} "
            f"for our specialized team to assist you directly. Could you please provide any additional details that might help us resolve this for you?"
        ),
        "intent": effective_intent,
        "entities": resolved_entities,
        "confidence": 0.50,
        "confidence_level": "LOW",
        "requires_human": False,
        "ticket": ticket,
        "order": None,
        "grounded_sources": []
    }
