import json
from openai import OpenAI
from app.core.config import settings

client = OpenAI(
    api_key=settings.DEEPSEEK_API_KEY,
    base_url=settings.DEEPSEEK_BASE_URL,
)

SYSTEM_PROMPT = """You are a document intelligence engine. Your job is to analyze 
extracted text from business and personal documents and return structured data.

You will always respond with ONLY valid JSON — no markdown, no explanation, 
no code fences. Just the raw JSON object.

Your response must follow this exact structure:
{
  "document_type": "<type>",
  "summary": "<summary>",
  "extracted_fields": {
    <key fields relevant to the document type>
  }
}

Document type must be one of:
invoice, receipt, contract, resume, cover_letter, government_form, 
bank_statement, medical_record, shipping_document, report, letter, other

Extracted fields should be the most useful structured data for that document type.
Examples:
- invoice: vendor_name, invoice_number, invoice_date, due_date, total_amount, line_items
- resume: candidate_name, email, phone, skills, experience, education
- contract: parties_involved, effective_date, expiry_date, key_obligations
- receipt: merchant_name, date, total_amount, items_purchased
- bank_statement: account_holder, account_number, statement_period, opening_balance, closing_balance
- government_form: form_type, applicant_name, submission_date, reference_number

If a field cannot be found in the text, set its value to null.
Always extract what you can — partial data is better than nothing."""


def analyze_document(extracted_text: str) -> tuple[dict, int, int]:
    """
    Send extracted OCR text to DeepSeek for classification,
    summarization, and structured field extraction.

    Returns (result_dict, input_tokens, output_tokens)
    """
    if not extracted_text or len(extracted_text.strip()) < 20:
        return (
            {
                "document_type": "other",
                "summary": "Document contained insufficient text for analysis.",
                "extracted_fields": {},
            },
            0,
            0,
        )

    text_to_analyze = extracted_text[:12000]
    if len(extracted_text) > 12000:
        text_to_analyze += "\n\n[Document truncated for analysis]"

    try:
        response = client.chat.completions.create(
            model=settings.DEEPSEEK_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"Analyze this document:\n\n{text_to_analyze}",
                },
            ],
            max_tokens=2000,  # Increased from 1000 to prevent truncation
            temperature=0.1,
        )

        input_tokens = response.usage.prompt_tokens if response.usage else 0
        output_tokens = response.usage.completion_tokens if response.usage else 0

        raw = response.choices[0].message.content.strip()

        # Log raw response for debugging
        print(f"[AI RAW RESPONSE]: {raw[:500]}")

        # Strip markdown fences if model wraps output anyway
        if "```" in raw:
            parts = raw.split("```")
            if len(parts) >= 3:
                raw = parts[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            raw = raw.strip()

        result = json.loads(raw)

        return (
            {
                "document_type": result.get("document_type", "other"),
                "summary": result.get("summary", ""),
                "extracted_fields": result.get("extracted_fields", {}),
            },
            input_tokens,
            output_tokens,
        )

    except json.JSONDecodeError as e:
        print(f"[AI JSON ERROR]: {e} | Raw response was: {raw[:300]}")
        return (
            {
                "document_type": "other",
                "summary": "AI analysis failed to return structured data.",
                "extracted_fields": {},
            },
            0,
            0,
        )
    except Exception as e:
        print(f"[AI ERROR]: {type(e).__name__}: {e}")
        return (
            {
                "document_type": "other",
                "summary": "AI analysis encountered an error.",
                "extracted_fields": {},
            },
            0,
            0,
        )