import os
import re
import json
import time
import base64
import urllib.request
import urllib.error
from typing import Dict, List, Optional, Any, Tuple

# Load environment variables from backend/.env if present
def _load_env_file():
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip("'\"")
                        if k and k not in os.environ:
                            os.environ[k] = v
        except Exception:
            pass

_load_env_file()

DEFAULT_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash").strip()
API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

def _extract_json_block(text: str) -> Optional[Any]:
    if not text:
        return None
    # Strip markdown code fences if present
    cleaned = text.strip()
    match = re.search(r"(\[.*\]|\{.*\})", cleaned, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except Exception:
            pass
    try:
        return json.loads(cleaned)
    except Exception:
        return None

class GeminiService:
    @staticmethod
    def get_api_key() -> str:
        return os.environ.get("GEMINI_API_KEY", "").strip()

    @staticmethod
    def get_model() -> str:
        return os.environ.get("GEMINI_MODEL", DEFAULT_MODEL).strip() or DEFAULT_MODEL

    @classmethod
    def is_configured(cls) -> bool:
        key = cls.get_api_key()
        return bool(key and len(key) > 10 and not key.startswith("your_"))

    @classmethod
    def execute_raw_request(
        cls,
        payload: Dict[str, Any],
        model: Optional[str] = None,
        timeout: float = 10.0,
        max_retries: int = 1
    ) -> Optional[Dict[str, Any]]:
        if not cls.is_configured():
            return None

        key = cls.get_api_key()
        active_model = model or cls.get_model()
        url = f"{API_ENDPOINT.format(model=active_model)}?key={key}"
        data = json.dumps(payload).encode("utf-8")

        for attempt in range(max_retries + 1):
            req = urllib.request.Request(
                url,
                data=data,
                headers={"Content-Type": "application/json"}
            )
            try:
                with urllib.request.urlopen(req, timeout=timeout) as response:
                    if response.status == 200:
                        res_body = response.read().decode("utf-8")
                        return json.loads(res_body)
            except urllib.error.HTTPError as e:
                # Retry once on 429 (rate limit) or 503 (service unavailable)
                if e.code in [429, 503] and attempt < max_retries:
                    time.sleep(1.5 * (attempt + 1))
                    continue
                return None
            except (urllib.error.URLError, TimeoutError):
                if attempt < max_retries:
                    time.sleep(1.0)
                    continue
                return None
            except Exception:
                return None

        return None

    @classmethod
    def generate_content(
        cls,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: int = 2048
    ) -> Optional[str]:
        contents: List[Dict[str, Any]] = [
            {"parts": [{"text": prompt}]}
        ]
        payload: Dict[str, Any] = {
            "contents": contents,
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens
            }
        }
        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        data = cls.execute_raw_request(payload)
        if not data:
            return None

        try:
            candidates = data.get("candidates", [])
            if candidates and "content" in candidates[0]:
                parts = candidates[0]["content"].get("parts", [])
                for part in parts:
                    if "text" in part and part["text"].strip():
                        return part["text"].strip()
        except Exception:
            pass
        return None

    @classmethod
    def enhance_chat_response(
        cls,
        user_message: str,
        grounded_facts: str,
        customer_name: str = "Elena",
        conversation_context: Optional[List[Dict[str, str]]] = None,
        language: str = "en"
    ) -> Optional[str]:
        system_prompt = (
            "You are Aegis, an elite enterprise AI customer support specialist. "
            "Your answers must be professional, direct, empathetic, and 100% truthful. "
            "CRITICAL RULES:\n"
            "1. Base your answer ONLY on the Grounded Business Facts below. "
            "2. Never fabricate order details, tracking codes, refund timelines, or policies. "
            "3. If details are missing, politely ask the customer for the specific information needed. "
            "4. Respond naturally in the customer's requested language. "
            "5. Keep the response concise, clear, and action-oriented."
        )

        context_str = ""
        if conversation_context:
            context_str = "Recent Conversation History:\n"
            for turn in conversation_context[-4:]:
                context_str += f"- {turn.get('role', 'user')}: {turn.get('message', '')}\n"

        prompt = (
            f"Customer Name: {customer_name}\n"
            f"Language: {language}\n"
            f"Customer Query: {user_message}\n\n"
            f"Grounded Business Facts:\n{grounded_facts}\n\n"
            f"{context_str}\n"
            f"Provide the exact, helpful customer reply:"
        )

        return cls.generate_content(prompt, system_instruction=system_prompt, temperature=0.3, max_tokens=800)

    @classmethod
    def generate_candidate_replies(
        cls,
        ticket_text: str,
        kb_context: str
    ) -> Optional[List[Dict[str, Any]]]:
        system_prompt = (
            "You are an AI customer support assistant. Given a customer inquiry and relevant policy knowledge, "
            "generate exactly 3 candidate auto-replies with different tones: Professional, Friendly, and Concise. "
            "Output MUST be strict JSON array with format:\n"
            '[{"tone": "Professional", "reply": "...", "confidence": 95}, '
            '{"tone": "Friendly", "reply": "...", "confidence": 92}, '
            '{"tone": "Concise", "reply": "...", "confidence": 90}]'
        )

        prompt = (
            f"Customer Inquiry: {ticket_text}\n\n"
            f"Policy Context:\n{kb_context}\n\n"
            f"Generate the 3 JSON formatted replies:"
        )

        resp = cls.generate_content(prompt, system_instruction=system_prompt, temperature=0.2, max_tokens=1000)
        if not resp:
            return None

        parsed = _extract_json_block(resp)
        if isinstance(parsed, list) and len(parsed) >= 1:
            return parsed
        return None

    @classmethod
    def analyze_root_cause(
        cls,
        problem_description: str,
        technical_logs: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        system_prompt = (
            "You are a Senior Site Reliability & Technical Support Engineer. "
            "Analyze the reported customer problem and determine the most probable root cause, "
            "diagnostic confidence percentage, and actionable resolution steps. "
            "Output MUST be valid JSON with keys: root_cause, confidence, resolution."
        )

        prompt = f"Reported Issue: {problem_description}\n"
        if technical_logs:
            prompt += f"System Telemetry: {technical_logs}\n"
        prompt += "\nOutput JSON:"

        resp = cls.generate_content(prompt, system_instruction=system_prompt, temperature=0.1, max_tokens=2048)
        if not resp:
            return None

        parsed = _extract_json_block(resp)
        if isinstance(parsed, dict) and "root_cause" in parsed and "resolution" in parsed:
            res_val = parsed["resolution"]
            if isinstance(res_val, list):
                parsed["resolution"] = " ".join([str(item) for item in res_val])
            return parsed
        return None

    @classmethod
    def analyze_sentiment(cls, text: str) -> Optional[Dict[str, Any]]:
        if not cls.is_configured():
            return None

        prompt = (
            "Analyze the sentiment, customer emotion, and urgency of this customer support message.\n"
            f"Message: \"{text}\"\n\n"
            "Respond ONLY with valid JSON strictly conforming to this schema:\n"
            "{\n"
            '  "sentiment": "POSITIVE" | "NEUTRAL" | "FRUSTRATED" | "ANGRY" | "URGENT",\n'
            '  "sentiment_score": float between -1.0 and 1.0,\n'
            '  "confidence": float between 50.0 and 100.0,\n'
            '  "urgency": "LOW" | "NORMAL" | "HIGH" | "CRITICAL",\n'
            '  "priority": "P1 - Critical" | "P2 - High" | "P3 - Medium" | "P4 - Low",\n'
            '  "reason": "brief explanation"\n'
            "}"
        )

        resp = cls.generate_content(prompt, temperature=0.1, max_tokens=1024, json_mode=True)
        if not resp:
            return None

        parsed = _extract_json_block(resp)
        if isinstance(parsed, dict) and "sentiment" in parsed:
            return parsed
        return None

    @classmethod
    def analyze_multimodal_image(
        cls,
        image_bytes: bytes,
        mime_type: str = "image/png"
    ) -> Optional[Dict[str, Any]]:
        if not cls.is_configured():
            return None

        b64_data = base64.b64encode(image_bytes).decode("utf-8")
        prompt = (
            "Analyze this customer error screenshot or document. "
            "Extract any visible error messages, HTTP status codes, or stack traces into 'extracted_ocr_text'. "
            "Classify the issue category (e.g., Payment Error, Application Error, Authentication Error, Technical Issue). "
            "Suggest the recommended action for support engineering. "
            "Output MUST be strict JSON with keys: issue_category, confidence, extracted_ocr_text, recommended_action, ml_detected_intent."
        )

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {
                            "inlineData": {
                                "mimeType": mime_type,
                                "data": b64_data
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "maxOutputTokens": 800
            }
        }

        data = cls.execute_raw_request(payload)
        if not data:
            return None

        try:
            candidates = data.get("candidates", [])
            if candidates and "content" in candidates[0]:
                parts = candidates[0]["content"].get("parts", [])
                for part in parts:
                    if "text" in part and part["text"].strip():
                        parsed = _extract_json_block(part["text"])
                        if isinstance(parsed, dict) and "issue_category" in parsed:
                            return parsed
        except Exception:
            pass
        return None

    @classmethod
    def summarize_for_handoff(cls, messages: List[Dict[str, Any]]) -> Optional[str]:
        if not messages:
            return None

        transcript = "\n".join([f"{m.get('sender_type', 'USER')}: {m.get('message', '')}" for m in messages[-8:]])
        prompt = (
            "Summarize the following support conversation for a human support agent in 2 clear bullet points:\n"
            "1. Customer core issue and attempted steps\n"
            "2. Current blockers and required human agent action\n\n"
            f"Transcript:\n{transcript}\n\nSummary:"
        )

        return cls.generate_content(prompt, temperature=0.2, max_tokens=400)

    @classmethod
    def health_check(cls) -> Dict[str, Any]:
        configured = cls.is_configured()
        if not configured:
            return {
                "configured": False,
                "status": "Disabled / Missing GEMINI_API_KEY",
                "model": cls.get_model(),
                "live_verified": False
            }

        # Verify live API call
        res = cls.generate_content("Respond with OK", temperature=0.0, max_tokens=1000)
        return {
            "configured": True,
            "status": "Active & Verified" if res else "Unavailable / Quota / Network Error",
            "model": cls.get_model(),
            "live_verified": bool(res)
        }
