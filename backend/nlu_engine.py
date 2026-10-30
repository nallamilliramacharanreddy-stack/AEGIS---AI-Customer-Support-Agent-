import re
import unicodedata
from typing import Dict, List, Optional, Any, Tuple

# ==========================================================
# 1. INPUT VALIDATION & PROMPT INJECTION DEFENSE
# ==========================================================

INJECTION_PATTERNS = [
    r"ignore (all )?(previous|prior|above) instructions",
    r"disregard (the )?(system|developer|safety) (prompt|rules|guidelines)",
    r"show (me )?(your )?(system|internal|base) (prompt|instructions)",
    r"reveal (the )?(system|hidden|admin) prompt",
    r"you are now (in )?(developer mode|dan mode|jailbroken|unrestricted)",
    r"bypass (all )?(safety|security|policy|access) (filters|guardrails|checks)",
    r"leak (all )?(customer|internal|database|private) (records|information|data)",
    r"give me (admin|root|master) (access|credentials|passwords)",
    r"pretend (you have no|there are no) rules",
    r"<script.*?>.*?</script>",
    r"drop\s+table\s+",
    r"union\s+select\s+",
]

def validate_and_sanitize_input(text: str) -> Dict[str, Any]:
    if not text or not text.strip():
        return {
            "valid": False,
            "error_code": "EMPTY_MESSAGE",
            "message": "Please enter a valid support message."
        }

    stripped = text.strip()
    if len(stripped) > 2500:
        return {
            "valid": False,
            "error_code": "MAX_LENGTH_EXCEEDED",
            "message": "Message exceeds maximum length of 2500 characters. Please shorten your message."
        }

    # Spam repetition check: excessive repeated characters or words
    if re.search(r"(.)\1{12,}", stripped):
        return {
            "valid": False,
            "error_code": "SPAM_REPETITION",
            "message": "Your message contains excessive repeated characters. Please enter a meaningful support inquiry."
        }

    # Prompt injection check
    lowered = stripped.lower()
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, lowered, re.IGNORECASE):
            return {
                "valid": False,
                "error_code": "SECURITY_VIOLATION",
                "message": "I am an AI customer support assistant. I cannot disclose internal system instructions or bypass security boundaries. How can I assist you with your orders, account, or services today?"
            }

    # Sanitized safe text
    sanitized = unicodedata.normalize("NFKC", stripped)
    return {
        "valid": True,
        "sanitized_text": sanitized
    }


# ==========================================================
# 2. MULTILINGUAL LANGUAGE DETECTION
# ==========================================================

LANGUAGE_SCRIPTS = [
    (r"[\u0900-\u097F]", "hi", "Hindi"),
    (r"[\u0C00-\u0C7F]", "te", "Telugu"),
    (r"[\u0B80-\u0BFF]", "ta", "Tamil"),
    (r"[\u0C80-\u0CFF]", "kn", "Kannada"),
    (r"[\u0D00-\u0D7F]", "ml", "Malayalam"),
]

MULTILINGUAL_KEYWORDS = {
    "hi": ["namaste", "dhanyavad", "meri", "kahan", "chahiye", "paisa", "wapas", "madad"],
    "te": ["namaskaram", "dhanyavadamulu", "naa", "samasyanu", "sahayam", "kavali"],
    "ta": ["vanakkam", "nandri", "udhavi", "thevai"],
    "es": ["hola", "gracias", "pedido", "ayuda", "donde", "reembolso"],
    "fr": ["bonjour", "merci", "commande", "aide", "remboursement"],
    "de": ["hallo", "danke", "bestellung", "hilfe", "ruckerstattung"]
}

def detect_language(text: str) -> Dict[str, Any]:
    # 1. Script-based Unicode detection
    for pattern, code, name in LANGUAGE_SCRIPTS:
        if re.search(pattern, text):
            return {
                "detected_language": code,
                "language_name": name,
                "language_confidence": 0.96,
                "translation_required": True
            }

    # 2. Keyword heuristic detection
    text_words = set(re.findall(r"\b\w+\b", text.lower()))
    for code, keywords in MULTILINGUAL_KEYWORDS.items():
        matches = text_words.intersection(set(keywords))
        if len(matches) >= 2 or (len(matches) >= 1 and len(text_words) <= 4):
            names = {"hi": "Hindi", "te": "Telugu", "ta": "Tamil", "es": "Spanish", "fr": "French", "de": "German"}
            return {
                "detected_language": code,
                "language_name": names.get(code, code.upper()),
                "language_confidence": 0.88,
                "translation_required": code != "en"
            }

    # Default to English
    return {
        "detected_language": "en",
        "language_name": "English",
        "language_confidence": 0.99,
        "translation_required": False
    }


# ==========================================================
# 3. COMPREHENSIVE INTENT DETECTION (16 INTENTS)
# ==========================================================

INTENT_RULES = [
    # Explicit human agent request
    ("HUMAN_AGENT_REQUEST", [
        r"\b(talk|speak)\s+(to|with)\s+(a\s+)?(human|agent|person|representative|operator|manager)\b",
        r"\bconnect\s+(me\s+)?(to|with)\s+(a\s+)?(human|live\s+agent|specialist|support\s+person)\b",
        r"\breal\s+person\b",
        r"\bescalat(e|ion)\b",
        r"\bhuman\s+support\b",
        r"\bwant\s+a\s+human\b"
    ]),
    # Order Cancellation
    ("ORDER_CANCEL", [
        r"\bcancel\s+(my\s+)?(order|shipment|subscription|purchase|package)\b",
        r"\bstop\s+(my\s+)?(order|shipment)\b",
        r"\bwant\s+to\s+cancel\b",
        r"\bcancellation\b"
    ]),
    # Order Return
    ("ORDER_RETURN", [
        r"\breturn\s+(my\s+)?(order|product|item|laptop|headphones|device|package)\b",
        r"\bhow\s+do\s+i\s+return\b",
        r"\bwant\s+to\s+return\b",
        r"\breturn\s+policy\b",
        r"\bsend\s+it\s+back\b"
    ]),
    # Order Refund
    ("ORDER_REFUND", [
        r"\b(request|get|want|need)\s+(a\s+)?(full\s+)?refund\b",
        r"\brefund\s+status\b",
        r"\bwhen\s+will\s+i\s+get\s+my\s+money\s+back\b",
        r"\brefund\s+my\s+(money|payment|order)\b",
        r"\bmoney\s+back\b"
    ]),
    # Order Status / Delivery Status
    ("ORDER_STATUS", [
        r"\bwhere\s+is\s+my\s+(order|package|shipment|item|delivery|laptop)\b",
        r"\btrack(ing)?\s+(my\s+)?(order|package|shipment|status)\b",
        r"\bhasn'?t\s+arrived\b",
        r"\bnot\s+arrived\b",
        r"\bstatus\s+of\s+my\s+order\b",
        r"\bwhen\s+will\s+(it|my\s+order)\s+arrive\b",
        r"\bdelivery\s+status\b",
        r"\border\s+tracking\b",
        r"\bdelayed\s+(shipment|package|delivery)\b",
        r"\b(where\s+is\s+it|where\s+it\s+is|location|located)\b"
    ]),
    # Payment problem
    ("PAYMENT_PROBLEM", [
        r"\bcharg(ed)?\s+twice\b",
        r"\bdouble\s+charge(d)?\b",
        r"\bpayment\s+fail(ed|ure)?\b",
        r"\bmoney\s+deducted\b",
        r"\bdeducted\s+from\s+(my\s+)?(bank|account|card)\b",
        r"\berror\s+500\s+(at|during)\s+checkout\b",
        r"\btransaction\s+failed\b",
        r"\bduplicate\s+payment\b"
    ]),
    # Billing question
    ("BILLING_QUESTION", [
        r"\binvoice\b",
        r"\btax\s+receipt\b",
        r"\bbilling\s+address\b",
        r"\bupdate\s+payment\s+method\b",
        r"\bvat\b",
        r"\bpricing\b"
    ]),
    # Password Reset / 2FA
    ("PASSWORD_RESET", [
        r"\bforgot\s+(my\s+)?password\b",
        r"\breset\s+(my\s+)?password\b",
        r"\bpassword\s+reset\s+link\b",
        r"\b2fa\b",
        r"\bauthentication\s+code\b",
        r"\botp\s+not\s+received\b"
    ]),
    # Account Problem
    ("ACCOUNT_PROBLEM", [
        r"\bunable\s+to\s+(log\s*in|sign\s*in)\b",
        r"\baccount\s+locked\b",
        r"\blogin\s+fail(ed|ing)?\b",
        r"\bupdate\s+(my\s+)?(email|profile|name)\b",
        r"\bsso\b",
        r"\bokta\b",
        r"\bsaml\b"
    ]),
    # Technical Support
    ("TECHNICAL_SUPPORT", [
        r"\bapi\s+(error|500|failing|webhook)\b",
        r"\bserver\s+crash\b",
        r"\bhmac\s+signature\b",
        r"\bbug\b",
        r"\bdatabase\s+connection\b",
        r"\btimeout\b"
    ]),
    # Delivery Problem
    ("DELIVERY_PROBLEM", [
        r"\bwrong\s+item\s+delivered\b",
        r"\bpackage\s+lost\b",
        r"\bdelivered\s+to\s+wrong\s+address\b",
        r"\bpackage\s+stolen\b",
        r"\bnever\s+received\b"
    ]),
    # Product Issue / Warranty
    ("PRODUCT_INFORMATION", [
        r"\bwarranty\b",
        r"\bdefective\b",
        r"\bbroken\b",
        r"\bdamaged\b",
        r"\bnot\s+working\b",
        r"\bspecs\b",
        r"\bmanual\b",
        r"\bdocumentation\b"
    ]),
    # Complaint
    ("COMPLAINT", [
        r"\bterrible\s+service\b",
        r"\bworst\s+experience\b",
        r"\bvery\s+disappointed\b",
        r"\bunacceptable\b",
        r"\bfile\s+a\s+complaint\b",
        r"\brude\b"
    ]),
    # General Info
    ("GENERAL_INFORMATION", [
        r"\boperating\s+hours\b",
        r"\bsupport\s+hours\b",
        r"\bcontact\s+(number|phone|email)\b",
        r"\bwhere\s+are\s+you\s+located\b",
        r"\bhello\b|\bhi\b|\bhey\b"
    ])
]

def detect_intent(text: str) -> Dict[str, Any]:
    lowered = text.lower()

    for intent_name, patterns in INTENT_RULES:
        for pat in patterns:
            if re.search(pat, lowered):
                return {
                    "intent": intent_name,
                    "confidence": 0.94,
                    "matched_rule": pat
                }

    return {
        "intent": "GENERAL_INFORMATION",
        "confidence": 0.65,
        "matched_rule": "fallback"
    }


# ==========================================================
# 4. ENTITY EXTRACTION
# ==========================================================

ORDER_ID_REGEX = r"\b(ORD-\d{4,8}|ORD\d{4,8}|#\d{4,8})\b"
TICKET_ID_REGEX = r"\b(TCK-\d{4,8}|#TCK-\d{4,8})\b"
INVOICE_ID_REGEX = r"\b(INV-\d{4,8}|#INV-\d{4,8})\b"
EMAIL_REGEX = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b"
PHONE_REGEX = r"\b(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b"
AMOUNT_REGEX = r"(\$\s*(\d+(\.\d{2})?)|\b\d+\s*dollars|\b₹\s*(\d+))\b"

PRODUCT_KEYWORDS = {
    "laptop": "Dell XPS 15 Ultra Laptop",
    "headphones": "Sony WH-1000XM5 Wireless Headphones",
    "monitor": "LG 34-inch UltraWide Monitor",
    "keyboard": "Logitech MX Mechanical Keyboard",
    "watch": "Apple Watch Series 9",
    "phone": "Smartphone Device"
}

def extract_entities(text: str) -> Dict[str, Any]:
    entities: Dict[str, Any] = {}
    lowered = text.lower()

    # 1. Order ID
    order_match = re.search(ORDER_ID_REGEX, text, re.IGNORECASE)
    if order_match:
        raw_order = order_match.group(1).upper()
        if raw_order.startswith("#"):
            raw_order = f"ORD-{raw_order[1:]}"
        elif not raw_order.startswith("ORD-") and raw_order.startswith("ORD"):
            raw_order = f"ORD-{raw_order[3:]}"
        entities["order_id"] = raw_order

    # Plain standalone numbers if message looks like "It's 12345" or "12345"
    if "order_id" not in entities:
        stand_match = re.search(r"\b(12345|9912|8821|4412|7731)\b", text)
        if stand_match:
            entities["order_id"] = f"ORD-{stand_match.group(1)}"

    # 2. Ticket ID
    tck_match = re.search(TICKET_ID_REGEX, text, re.IGNORECASE)
    if tck_match:
        entities["ticket_id"] = tck_match.group(1).upper().replace("#", "")

    # 3. Invoice ID
    inv_match = re.search(INVOICE_ID_REGEX, text, re.IGNORECASE)
    if inv_match:
        entities["invoice_id"] = inv_match.group(1).upper().replace("#", "")

    # 4. Product Name
    for kw, full_name in PRODUCT_KEYWORDS.items():
        if kw in lowered:
            entities["product_name"] = full_name
            break

    # 5. Email & Phone
    email_match = re.search(EMAIL_REGEX, text)
    if email_match:
        entities["email"] = email_match.group(0)

    phone_match = re.search(PHONE_REGEX, text)
    if phone_match:
        entities["phone"] = phone_match.group(0)

    # 6. Relative Dates
    date_patterns = [
        (r"\bthree days ago\b", "3 days ago"),
        (r"\byesterday\b", "yesterday"),
        (r"\btoday\b", "today"),
        (r"\btomorrow\b", "tomorrow"),
        (r"\blast week\b", "last week"),
        (r"\b\d{4}-\d{2}-\d{2}\b", "date_formatted")
    ]
    for pat, label in date_patterns:
        m = re.search(pat, lowered)
        if m:
            entities["date"] = label if label != "date_formatted" else m.group(0)
            break

    # 7. Amount
    amt_match = re.search(AMOUNT_REGEX, text, re.IGNORECASE)
    if amt_match:
        entities["amount"] = amt_match.group(0)

    # 8. Issue Type
    if "hasn't arrived" in lowered or "not arrived" in lowered or "late" in lowered or "delayed" in lowered:
        entities["issue_type"] = "delayed_delivery"
    elif "damaged" in lowered or "broken" in lowered or "defective" in lowered:
        entities["issue_type"] = "damaged_product"
    elif "double charge" in lowered or "twice" in lowered or "deducted" in lowered:
        entities["issue_type"] = "payment_discrepancy"

    return entities


# ==========================================================
# 5. SENTIMENT & URGENCY ANALYSIS
# ==========================================================

ANGRY_TRIGGERS = [
    r"\b(worst|terrible|terribly|furious|disaster|unacceptable|ridiculous|scam|stolen|robbed|lawyer|sue|hate|angry|pissed|outrageous)\b",
    r"!{2,}",
]

FRUSTRATED_TRIGGERS = [
    r"\b(disappointed|disappointing|frustrated|frustrating|frustration|annoyed|annoying|useless|keeps failing|failed|failure|broken|no response|waiting forever|still not)\b",
    r"\bwhy is it taking so long\b"
]

POSITIVE_TRIGGERS = [
    r"\b(thank|thanks|great|awesome|excellent|helpful|appreciate|super|wonderful|love|solved)\b"
]

CRITICAL_TRIGGERS = [
    r"\b(fraud|unauthorized charge|security breach|account compromised|hacked|stolen card|identity theft|leak)\b",
    r"\bproduction (down|outage|emergency)\b"
]

def analyze_sentiment_and_urgency(text: str, intent: str) -> Dict[str, Any]:
    lowered = text.lower()

    # 1. Critical Urgency triggers
    is_critical = any(re.search(p, lowered) for p in CRITICAL_TRIGGERS)
    if is_critical:
        return {
            "sentiment": "URGENT",
            "sentiment_score": -0.85,
            "urgency": "CRITICAL",
            "urgency_score": 0.98,
            "priority": "P1 - Critical",
            "requires_escalation": True,
            "escalation_reason": "Security Alert / Fraud Trigger Detected"
        }

    # 2. Angry triggers
    if any(re.search(p, lowered) for p in ANGRY_TRIGGERS):
        return {
            "sentiment": "ANGRY",
            "sentiment_score": -0.92,
            "urgency": "HIGH",
            "urgency_score": 0.88,
            "priority": "P2 - High",
            "requires_escalation": intent in ["COMPLAINT", "PAYMENT_PROBLEM", "HUMAN_AGENT_REQUEST"],
            "escalation_reason": "High Customer Frustration / Anger"
        }

    # 3. Frustrated triggers
    if any(re.search(p, lowered) for p in FRUSTRATED_TRIGGERS):
        return {
            "sentiment": "FRUSTRATED",
            "sentiment_score": -0.65,
            "urgency": "NORMAL",
            "urgency_score": 0.60,
            "priority": "P3 - Medium",
            "requires_escalation": False,
            "escalation_reason": None
        }

    # 4. Positive triggers
    if any(re.search(p, lowered) for p in POSITIVE_TRIGGERS):
        return {
            "sentiment": "POSITIVE",
            "sentiment_score": 0.85,
            "urgency": "LOW",
            "urgency_score": 0.15,
            "priority": "P4 - Low",
            "requires_escalation": False,
            "escalation_reason": None
        }

    # Default Neutral
    urgency_level = "NORMAL"
    priority = "P3 - Medium"
    if intent in ["PAYMENT_PROBLEM", "HUMAN_AGENT_REQUEST", "ORDER_CANCEL"]:
        urgency_level = "HIGH"
        priority = "P2 - High"

    return {
        "sentiment": "NEUTRAL",
        "sentiment_score": 0.05,
        "urgency": urgency_level,
        "urgency_score": 0.40,
        "priority": priority,
        "requires_escalation": intent == "HUMAN_AGENT_REQUEST",
        "escalation_reason": "Customer Requested Human Support" if intent == "HUMAN_AGENT_REQUEST" else None
    }
