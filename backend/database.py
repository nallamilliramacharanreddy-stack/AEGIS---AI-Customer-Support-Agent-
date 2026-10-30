import sqlite3
import os
import json
from datetime import datetime
from typing import Dict, List, Optional, Any

DB_PATH = os.path.join(os.path.dirname(__file__), "support_system.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Customers
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS customers (
        customer_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        tier TEXT DEFAULT 'Standard',
        created_at TEXT NOT NULL
    );
    """)

    # 2. Orders
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        order_id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        total_amount REAL NOT NULL,
        status TEXT NOT NULL,
        carrier TEXT,
        tracking_number TEXT,
        order_date TEXT NOT NULL,
        estimated_delivery TEXT,
        delivery_address TEXT,
        return_eligible INTEGER DEFAULT 1,
        cancel_eligible INTEGER DEFAULT 1,
        updated_at TEXT
    );
    """)

    # 3. Knowledge Documents
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS knowledge_documents (
        document_id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        content TEXT NOT NULL,
        version TEXT DEFAULT '1.0',
        effective_date TEXT,
        source TEXT DEFAULT 'Internal Support Policy',
        status TEXT DEFAULT 'ACTIVE',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    );
    """)

    # 4. Conversations
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS conversations (
        conversation_id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        language TEXT DEFAULT 'en',
        intent TEXT,
        priority TEXT DEFAULT 'P3 - Medium',
        sentiment TEXT DEFAULT 'Neutral',
        urgency TEXT DEFAULT 'NORMAL',
        assigned_agent TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        closed_at TEXT
    );
    """)

    # 5. Messages
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS messages (
        message_id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        sender_type TEXT NOT NULL,
        message TEXT NOT NULL,
        intent TEXT,
        entities_json TEXT,
        sentiment TEXT,
        urgency TEXT,
        confidence REAL,
        timestamp TEXT NOT NULL
    );
    """)

    # 6. AI Responses
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ai_responses (
        response_id TEXT PRIMARY KEY,
        message_id TEXT,
        conversation_id TEXT NOT NULL,
        model_name TEXT NOT NULL,
        model_version TEXT NOT NULL,
        retrieval_score REAL,
        confidence REAL,
        response TEXT NOT NULL,
        requires_human INTEGER DEFAULT 0,
        grounded_sources_json TEXT,
        created_at TEXT NOT NULL
    );
    """)

    # 7. Tickets
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tickets (
        ticket_id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        customer_name TEXT,
        conversation_id TEXT,
        subject TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        priority TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Open',
        assigned_agent TEXT,
        resolution TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        resolved_at TEXT
    );
    """)

    # 8. Feedback
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS feedback (
        feedback_id TEXT PRIMARY KEY,
        conversation_id TEXT,
        message_id TEXT,
        rating TEXT NOT NULL,
        comment TEXT,
        created_at TEXT NOT NULL
    );
    """)

    # 9. Audit Logs
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        log_id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        event_type TEXT NOT NULL,
        conversation_id TEXT,
        details_json TEXT
    );
    """)

    conn.commit()

    # Check if seed data exists
    cursor.execute("SELECT COUNT(*) FROM customers")
    if cursor.fetchone()[0] == 0:
        seed_data(conn)
    conn.close()

def seed_data(conn):
    cursor = conn.cursor()
    now = datetime.now().isoformat()

    # Seed Customers
    customers = [
        ("CUST-104", "Elena Rostova", "elena@aegis-ai.io", "+1-555-0199", "Enterprise", now),
        ("CUST-102", "Sarah Jenkins", "sarah.j@stripe-client.com", "+1-555-0144", "Pro", now),
        ("CUST-103", "Alex Rivera", "alex@linear-team.org", "+1-555-0182", "Standard", now),
        ("CUST-101", "Marcus Vance", "m.vance@figma-designers.co", "+1-555-0128", "Enterprise", now),
    ]
    cursor.executemany("INSERT INTO customers VALUES (?, ?, ?, ?, ?, ?)", customers)

    # Seed Orders
    orders = [
        ("ORD-12345", "CUST-104", "Dell XPS 15 Ultra Laptop (32GB RAM, 1TB SSD)", 1, 1899.99, "OUT_FOR_DELIVERY", "FedEx Express", "FX-882910432", "2026-09-28T10:15:00", "Today by 5:00 PM", "452 Innovation Blvd, San Francisco, CA", 1, 0, now),
        ("ORD-9912", "CUST-104", "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones", 1, 349.99, "PROCESSING", "DHL Express", "DHL-9920148", "2026-09-30T14:22:00", "Oct 04, 2026", "452 Innovation Blvd, San Francisco, CA", 1, 1, now),
        ("ORD-8821", "CUST-102", "LG 34-inch UltraWide Curved 144Hz Monitor", 1, 849.00, "DELIVERED", "UPS Ground", "1Z9999999999999999", "2026-09-23T09:00:00", "Delivered on Sep 26, 2026", "88 King St, Austin, TX", 1, 0, now),
        ("ORD-4412", "CUST-103", "Logitech MX Mechanical Wireless Tactile Keyboard", 1, 169.99, "SHIPPED", "USPS Priority", "9400100000000000000000", "2026-09-29T11:45:00", "Tomorrow by 3:00 PM", "12 Beacon St, Boston, MA", 1, 0, now),
        ("ORD-7731", "CUST-104", "Apple Watch Series 9 GPS 45mm Aluminum", 1, 399.00, "CANCELLED", "None", "None", "2026-09-15T08:30:00", "Cancelled & Refunded", "452 Innovation Blvd, San Francisco, CA", 0, 0, now),
    ]
    cursor.executemany("INSERT INTO orders VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", orders)

    # Seed Knowledge Documents
    kb_docs = [
        ("KB-101", "Order Tracking & Delivery Status", "Order",
         "You can track your order in real-time using your 8-digit order number (e.g., ORD-12345). Once dispatched, carrier tracking codes from FedEx, UPS, or DHL will show live location. Standard delivery takes 3-5 business days; Express delivery arrives in 1-2 business days. If a package shows Out for Delivery, the carrier will complete delivery by 5:00 PM local time.",
         "1.0", "2026-01-01", "Logistics Operations", "ACTIVE", now, now),

        ("KB-102", "30-Day Money-Back Guarantee & Return Policy", "Refund",
         "We offer a 30-day money-back guarantee on all eligible hardware products from the date of delivery. Items must be in original condition with accessories included. Defective or damaged items qualify for instant pre-paid return shipping labels. Once our inspection facility receives your return package, your refund is credited within 3-5 business days.",
         "1.1", "2026-01-01", "Customer Billing Policy", "ACTIVE", now, now),

        ("KB-103", "Order Cancellation Policy & Cutoff Windows", "Cancellation",
         "Orders in 'PLACED' or 'PROCESSING' status can be cancelled immediately without penalty with 100% full refund to your original payment method. Once an order status changes to 'SHIPPED' or 'OUT_FOR_DELIVERY', it cannot be intercepted in transit. In that scenario, customers can refuse the delivery or initiate a free return immediately upon arrival.",
         "1.0", "2026-01-01", "Fulfillment Rules", "ACTIVE", now, now),

        ("KB-104", "Payment Failure Troubleshooting & Duplicate Charges", "Payment",
         "If your card is charged but no order confirmation appears, our payment gateway auto-reversal service releases the pending authorization hold within 24 hours. Common causes for payment error 500 include 3D Secure OTP timeouts, billing zip code mismatch, or international card restrictions. For duplicate charges, our billing engine auto-credits duplicate invoice amounts.",
         "1.2", "2026-02-15", "Treasury & Gateway", "ACTIVE", now, now),

        ("KB-105", "Account Password Reset & 2FA Recovery", "Account",
         "To reset your account password, click 'Forgot Password' on the login screen or request a security link. Automated reset tokens remain valid for 60 minutes. If 2FA authentication SMS codes are delayed, backup recovery codes can be used, or contact support for identity verification unlock.",
         "1.0", "2026-01-01", "Security & IAM", "ACTIVE", now, now),

        ("KB-106", "Webhook Signature Verification & API 500 Troubleshooting", "Technical",
         "Production webhooks include the SHA-256 HMAC header 'x-aegis-signature-256'. Always compute signatures against the raw binary UTF-8 request body prior to JSON parsing. Common 500 errors occur when payload bodies are mutated by reverse proxy middleware or when timestamp drift exceeds 300 seconds.",
         "2.4", "2026-03-01", "Developer Platform", "ACTIVE", now, now),

        ("KB-107", "Enterprise SAML 2.0 Single Sign-On (Okta / Azure AD)", "Account",
         "Aegis Enterprise supports SAML 2.0 and SCIM 2.0 provisioning. To configure Okta or Microsoft Entra ID (Azure AD), upload your Identity Provider Metadata XML in Admin -> Security -> Single Sign-On, and set ACS URL to https://auth.aegis-support.io/saml/callback.",
         "1.5", "2026-01-01", "Enterprise IAM", "ACTIVE", now, now),

        ("KB-108", "Hardware Warranty Coverage & Defect Replacement", "Product",
         "All enterprise devices include a comprehensive 1-year manufacturer warranty against defects in materials and workmanship. Screen flickering, unexpected shutdowns, and broken ports are covered under our Advanced Hardware Replacement program with overnight replacement dispatch.",
         "1.0", "2026-01-01", "Hardware Engineering", "ACTIVE", now, now),
    ]
    cursor.executemany("INSERT INTO knowledge_documents VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", kb_docs)

    # Seed Initial Tickets (matching mock data)
    tickets = [
        ("TCK-9401", "CUST-102", "Sarah Jenkins", "CONV-MOCK-1", "API Webhook signature validation failing after v2.4 upgrade",
         "Our production webhook endpoint received 500 error due to signature verification mismatch on HMAC-SHA256 headers after the recent v2.4 release.",
         "Technical", "P1 - Critical", "Open", "DevOps On-Call", None, now, now, None),

        ("TCK-9402", "CUST-103", "Alex Rivera", "CONV-MOCK-2", "Accidental duplicate subscription charge on Pro Plan",
         "I noticed two separate pending charges of $199 on our invoice #INV-8821. Need immediate refund for the duplicate charge.",
         "Billing", "P2 - High", "In Progress", "Billing Support Team", None, now, now, None),

        ("TCK-9403", "CUST-104", "Elena Rostova", "CONV-MOCK-3", "Requesting SAML SSO configuration guide for Okta",
         "We are expanding our team to 500 enterprise users and need to connect Okta SAML 2.0 Single Sign-On to our workspace.",
         "Account Access", "P3 - Medium", "Resolved", "Elena Rostova", "Provided SAML 2.0 Integration guide and Metadata XML endpoint.", now, now, now),

        ("TCK-9404", "CUST-101", "Marcus Vance", "CONV-MOCK-4", "Feature Request: Export Analytics CSV with custom date range",
         "It would be amazing if the analytics export button allowed filtering by arbitrary timestamp intervals instead of fixed monthly blocks.",
         "Feature Request", "P4 - Low", "Open", "Product Team", None, now, now, None),
    ]
    cursor.executemany("INSERT INTO tickets VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", tickets)

    conn.commit()

# Run initialization
if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at:", DB_PATH)
