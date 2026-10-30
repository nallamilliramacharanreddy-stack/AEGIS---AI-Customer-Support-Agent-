import os
# pyrefly: ignore [missing-import]
import joblib
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
from sklearn.pipeline import Pipeline

# Directory setup
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODELS_DIR, exist_ok=True)

print("🚀 Starting Machine Learning Model Training Pipeline...")

# ==========================================================
# 1. DATASETS DEFINITION
# ==========================================================

# 1.1 Intent Classification Dataset (10 core support intents)
intent_data = [
    ("Where is my package? The tracking has not updated for 3 days.", "delivery_issue"),
    ("My shipment is delayed and hasn't arrived yet.", "delivery_issue"),
    ("Package shows delivered but I haven't received it.", "delivery_issue"),
    ("Wrong item delivered in my order.", "delivery_issue"),
    ("I was charged twice on my credit card for order #4912.", "payment_issue"),
    ("Payment failed during checkout with error code 500.", "payment_issue"),
    ("Money deducted from account but order not created.", "payment_issue"),
    ("Invoice shows incorrect sales tax calculation.", "payment_issue"),
    ("I would like to request a full refund for my recent purchase.", "refund_request"),
    ("Can I get a refund? Product is defective.", "refund_request"),
    ("Issued a return, when will my refund be processed?", "refund_request"),
    ("Refund status check for order #8821.", "refund_request"),
    ("Please cancel my order #9912 immediately.", "cancellation"),
    ("I ordered by mistake, please cancel shipment.", "cancellation"),
    ("Can I cancel my subscription before next billing cycle?", "cancellation"),
    ("Cancel order and return funds to my account.", "cancellation"),
    ("Unable to log in to my account with correct password.", "password_reset"),
    ("Forgot my password, please send reset link.", "password_reset"),
    ("2FA authentication code not received on phone.", "password_reset"),
    ("Reset password email link is expired.", "password_reset"),
    ("API returning 500 Internal Server error on webhook trigger.", "technical_issue"),
    ("SDK signature verification failing with HMAC mismatch.", "technical_issue"),
    ("Database connection timeout during peak traffic.", "technical_issue"),
    ("App crashes every time I open the order history tab.", "technical_issue"),
    ("Cannot update profile email address in settings.", "account_issue"),
    ("Account locked due to multiple failed login attempts.", "account_issue"),
    ("Need to transfer account ownership to another admin.", "account_issue"),
    ("How do I update billing address in my profile?", "account_issue"),
    ("Where can I find product documentation and setup guide?", "general_query"),
    ("What are your customer support operating hours?", "general_query"),
    ("Do you offer enterprise pricing or volume discount?", "general_query"),
    ("Is there a mobile app available for iOS and Android?", "general_query"),
    ("The screen display on the device is flickering.", "product_issue"),
    ("Item arrived damaged with broken glass panel.", "product_issue"),
    ("Product missing cables and power adapter from box.", "product_issue"),
    ("Device shuts down unexpectedly after 10 minutes.", "product_issue"),
]

# 1.2 Ticket Classification Dataset (Category & Priority)
ticket_data = [
    ("Payment failed on checkout page. Money deducted.", "Payment", "High"),
    ("Double charge on invoice #9012.", "Payment", "High"),
    ("Need tax receipt for business expense.", "Payment", "Low"),
    ("Where is order #1042? Tracking shows in transit.", "Order", "Medium"),
    ("Modify shipping address for active order.", "Order", "Medium"),
    ("Package lost by carrier delivery service.", "Delivery", "High"),
    ("Courier delivered to wrong door address.", "Delivery", "Medium"),
    ("Request full refund for defective unit.", "Refund", "High"),
    ("Refund not credited after 7 business days.", "Refund", "High"),
    ("Cancel order #5512 before dispatch.", "Cancellation", "Medium"),
    ("Stop monthly auto-renew subscription.", "Cancellation", "Medium"),
    ("Cannot sign in to dashboard, password reset fails.", "Account", "High"),
    ("Update organization name on account.", "Account", "Low"),
    ("API 500 error on webhook header verification.", "Technical", "Critical"),
    ("Server crash during high traffic burst.", "Technical", "Critical"),
    ("Mobile application freezes on checkout screen.", "Technical", "High"),
    ("Product unit does not turn on out of the box.", "Product", "High"),
    ("Missing instruction manual in product package.", "Product", "Low"),
    ("General inquiry regarding product warranty terms.", "General", "Low"),
    ("What payment methods are supported on your platform?", "General", "Low"),
]

# 1.3 Sentiment Analysis Dataset
sentiment_data = [
    ("This is the worst customer service experience ever. Terrible!", "Negative"),
    ("Extremely disappointed. Money stolen and no response!", "Negative"),
    ("App keeps crashing, useless software.", "Negative"),
    ("Frustrated with delayed shipping and zero updates.", "Negative"),
    ("Your support team was unhelpful and rude.", "Negative"),
    ("Thank you so much! My issue was resolved in 5 minutes.", "Positive"),
    ("Outstanding support! Very fast and helpful response.", "Positive"),
    ("Great product, works flawlessly as expected.", "Positive"),
    ("Appreciate the quick refund processing. Five stars!", "Positive"),
    ("Super easy setup, very satisfied with the service.", "Positive"),
    ("I need to check the status of my order #8812.", "Neutral"),
    ("Please send the invoice to my accounting email.", "Neutral"),
    ("What are the system requirements for v2.4?", "Neutral"),
    ("Can I change my registered email address?", "Neutral"),
    ("Looking for product documentation and user guide.", "Neutral"),
]

# 1.4 AI Root Cause Analysis Dataset
root_cause_data = [
    ("Money deducted but order not created", "Payment", "payment_gateway_timeout", "Retry transaction after 15 mins or verify bank webhook payload."),
    ("Signature verification fails on HMAC headers", "Technical", "api_header_encoding_mismatch", "Upgrade SDK to v2.4.1 to handle UTF-8 encoded signature headers."),
    ("User locked out after password reset", "Account", "expired_auth_token", "Trigger fresh identity verification link via SMS/Email."),
    ("Package marked delivered but not at doorstep", "Delivery", "carrier_wrong_address_scan", "Initiate carrier tracer investigation and prepare auto-replacement."),
    ("Refund not reflecting on credit card statement", "Refund", "interbank_settlement_delay", "Advise customer 3-5 business days processing window for bank settlement."),
]

# 1.5 Autonomous Support Action Dataset
action_data = [
    ("Where is my order #9912?", "order_status", "Neutral", "Check Order"),
    ("Please refund my payment immediately", "refund_request", "Negative", "Request Refund"),
    ("Cancel order #4412 right now", "cancellation", "Negative", "Cancel Order"),
    ("System is completely down with 500 error!", "technical_issue", "Negative", "Escalate"),
    ("How do I update my profile password?", "password_reset", "Neutral", "Account Assistance"),
    ("Thanks for sending the tracking code!", "general_query", "Positive", "Answer Customer"),
]

# 1.6 Auto-Reply & Knowledge Base Dataset
kb_dataset = [
    {
        "question": "How do I check my order tracking status?",
        "intent": "delivery_issue",
        "category": "Order",
        "answer": "You can track your order in real-time by navigating to Dashboard > Orders, or by clicking the tracking link in your dispatch email.",
        "content": "Real-time order tracking is available via courier integration. Enter your 8-digit order ID to view current transit location."
    },
    {
        "question": "What is the policy for refunds and returns?",
        "intent": "refund_request",
        "category": "Refund",
        "answer": "We offer a 30-day money-back guarantee for unused items. Refunds are credited back to your original payment method within 3-5 business days.",
        "content": "Returns must be initiated within 30 days of receipt. Defective products qualify for instant pre-paid shipping labels."
    },
    {
        "question": "How do I reset my account password?",
        "intent": "password_reset",
        "category": "Account",
        "answer": "Click 'Forgot Password' on the login screen. An automated reset link will be sent to your registered email address.",
        "content": "Password reset tokens remain valid for 60 minutes. Check your spam folder if the email does not appear in your inbox."
    },
    {
        "question": "What should I do if my payment fails at checkout?",
        "intent": "payment_issue",
        "category": "Payment",
        "answer": "Ensure card billing address matches your bank record. If money was deducted without order confirmation, funds automatically revert within 24 hours.",
        "content": "Common payment failure causes include 3D Secure verification timeouts and card limit restrictions. Contact your bank or try an alternate card."
    },
    {
        "question": "How do I cancel my active subscription or pending order?",
        "intent": "cancellation",
        "category": "Cancellation",
        "answer": "Pending orders can be cancelled directly under Dashboard > Orders before dispatch. Active subscriptions can be cancelled under Billing Settings.",
        "content": "Orders cancelled prior to warehouse dispatch trigger immediate full refund authorization."
    }
]

# ==========================================================
# 2. MODEL TRAINING & EVALUATION PIPELINE
# ==========================================================

print("\n--- Training Intent Classification Model ---")
df_intent = pd.DataFrame(intent_data, columns=["text", "intent"])
vectorizer_intent = TfidfVectorizer(ngram_range=(1, 2), min_df=1)
X_intent = vectorizer_intent.fit_transform(df_intent["text"])
model_intent = LogisticRegression(C=1.0, max_iter=200)
model_intent.fit(X_intent, df_intent["intent"])

preds_intent = model_intent.predict(X_intent)
acc_intent = accuracy_score(df_intent["intent"], preds_intent)
print(f"✅ Intent Model Trained! Accuracy: {acc_intent*100:.2f}%")

print("\n--- Training Ticket Category & Priority Models ---")
def train_all_models():
    print("🚀 Starting Machine Learning Model Training Pipeline...")
    # 1. Intent Model
    df_intent = pd.DataFrame(intent_data, columns=["text", "intent"])
    vectorizer_intent = TfidfVectorizer(ngram_range=(1, 2), min_df=1)
    X_intent = vectorizer_intent.fit_transform(df_intent["text"])
    model_intent = LogisticRegression(C=1.0, max_iter=200)
    model_intent.fit(X_intent, df_intent["intent"])

    # 2. Ticket Category & Priority
    df_ticket = pd.DataFrame(ticket_data, columns=["text", "category", "priority"])
    vectorizer_ticket = TfidfVectorizer(ngram_range=(1, 2), min_df=1)
    X_ticket = vectorizer_ticket.fit_transform(df_ticket["text"])
    model_category = LinearSVC(C=1.0)
    model_category.fit(X_ticket, df_ticket["category"])
    model_priority = LogisticRegression(C=1.0, max_iter=200)
    model_priority.fit(X_ticket, df_ticket["priority"])

    # 3. Sentiment Model
    df_sent = pd.DataFrame(sentiment_data, columns=["text", "sentiment"])
    vectorizer_sent = TfidfVectorizer(ngram_range=(1, 2), min_df=1)
    X_sent = vectorizer_sent.fit_transform(df_sent["text"])
    model_sent = LogisticRegression(C=1.0, max_iter=200)
    model_sent.fit(X_sent, df_sent["sentiment"])

    # 4. Root Cause Model
    df_rc = pd.DataFrame(root_cause_data, columns=["text", "category", "root_cause", "resolution"])
    vectorizer_rc = TfidfVectorizer(ngram_range=(1, 2), min_df=1)
    X_rc = vectorizer_rc.fit_transform(df_rc["text"])
    model_rc = LogisticRegression(C=1.0, max_iter=200)
    model_rc.fit(X_rc, df_rc["root_cause"])

    # 5. Action Model
    df_act = pd.DataFrame(action_data, columns=["text", "intent", "sentiment", "action"])
    vectorizer_act = TfidfVectorizer(ngram_range=(1, 2), min_df=1)
    X_act = vectorizer_act.fit_transform(df_act["text"])
    model_act = LogisticRegression(C=1.0, max_iter=200)
    model_act.fit(X_act, df_act["action"])

    # 6. Knowledge Base Vectorizer
    kb_texts = [f"{item['question']} {item['content']}" for item in kb_dataset]
    vectorizer_kb = TfidfVectorizer(ngram_range=(1, 2), min_df=1)
    X_kb = vectorizer_kb.fit_transform(kb_texts)

    # Serialize
    joblib.dump((vectorizer_intent, model_intent), os.path.join(MODELS_DIR, "intent_model.pkl"))
    joblib.dump((vectorizer_ticket, model_category, model_priority), os.path.join(MODELS_DIR, "ticket_model.pkl"))
    joblib.dump((vectorizer_sent, model_sent), os.path.join(MODELS_DIR, "sentiment_model.pkl"))
    joblib.dump((vectorizer_rc, model_rc, df_rc.set_index("root_cause")["resolution"].to_dict()), os.path.join(MODELS_DIR, "root_cause_model.pkl"))
    joblib.dump((vectorizer_act, model_act), os.path.join(MODELS_DIR, "action_model.pkl"))
    joblib.dump((vectorizer_kb, X_kb, kb_dataset), os.path.join(MODELS_DIR, "knowledge_base.pkl"))
    print(f"🎉 All Machine Learning models successfully trained and serialized to '{MODELS_DIR}'!")
    return True

if __name__ == "__main__":
    train_all_models()
