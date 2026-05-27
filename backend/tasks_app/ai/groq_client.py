import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class GroqClient:
    def __init__(self, api_key: str = None, model: str = None):
        self.api_key = api_key or getattr(settings, "GROQ_API_KEY", "")
        self.model = model or getattr(settings, "GROQ_MODEL", "llama-3.1-8b-instant")
        self.base_url = getattr(settings, "GROQ_API_URL", "https://api.groq.com/openai/v1")

        self.fallback = str(
            getattr(settings, "GROQ_FALLBACK_MOCK", True)
        ).lower() in ("true", "1", "yes")

        if not self.api_key:
            raise ValueError("GROQ_API_KEY is missing")

        try:
            from groq import Groq
            self.client = Groq(api_key=self.api_key)
        except Exception as e:
            logger.warning("Groq SDK not installed, using HTTP only: %s", e)
            self.client = None

    def generate(self, prompt: str):
        try:
            # SDK mode
            if self.client:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.7,
                    max_tokens=1024,
                )

                text = response.choices[0].message.content.strip()

                return {"output": text}

            # HTTP fallback
            url = f"{self.base_url}/chat/completions"
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            }

            payload = {
                "model": self.model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7,
                "max_tokens": 1024,
            }

            r = requests.post(url, json=payload, headers=headers, timeout=30)

            if not r.ok:
                logger.error("Groq API error (%s): %s", r.status_code, r.text)

                if self.fallback:
                    return {"output": prompt[::-1]}

                r.raise_for_status()

            data = r.json()
            text = data["choices"][0]["message"]["content"].strip()

            return {"output": text}

        except Exception as exc:
            logger.exception("Groq request failed: %s", exc)

            if self.fallback:
                return {"output": "fallback: " + prompt[::-1]}

            raise