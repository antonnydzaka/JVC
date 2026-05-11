import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv
import PIL.Image

load_dotenv()

def get_client():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Warning: GEMINI_API_KEY not found in environment")
    return genai.Client(api_key=api_key)

def generate_financial_report(transactions):
    client = get_client()
    
    # Prepare transaction data for prompt
    tx_text = "Transactions:\n"
    for tx in transactions:
        tx_text += f"Date: {tx.date}, Amount: {tx.amount}, Type: {tx.account_type}, Description: {tx.description}\n"

    prompt = f"""
    You are an expert financial analyst. Please analyze the following transactions and generate a standard financial report.
    The report should include a Balance Sheet, Profit and Loss Statement, and Cash Flow Statement.

    {tx_text}

    Format the output strictly as JSON with the following structure:
    {{
        "Profit and Loss Statement": {{
            "Total_Pendapatan": number,
            "Total_Beban": number,
            "Laba_Bersih": number
        }},
        "Balance Sheet": {{
            "Total_Aset": number,
            "Total_Kewajiban": number,
            "Total_Ekuitas": number
        }},
        "Cash Flow Statement": {{
            "Arus_Kas_Operasional": {{ "Net_Arus_Kas": number }},
            "Arus_Kas_Investasi": {{ "Net_Arus_Kas": number }},
            "Arus_Kas_Pendanaan": {{ "Net_Arus_Kas": number }},
            "Saldo_Kas_Akhir": number
        }}
    }}
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Error generating report: {e}")
        return {"error": str(e)}

def validate_invoice(image_path, transaction):
    client = get_client()
    
    try:
        image = PIL.Image.open(image_path)
    except Exception as e:
        return {"error": f"Could not open image: {e}"}

    tx_info = "No database record found"
    if transaction:
        tx_info = f"Date: {transaction.date}, Amount: {transaction.amount}, Description: {transaction.description}"

    prompt = f"""
    You are an AI invoice validator. Please extract the data from this invoice image and cross-check it with the following database record:
    Database Record: {tx_info}

    Determine if the invoice matches the database record. Return strictly as JSON:
    {{
        "status_validasi": "Sesuai" | "Tidak Sesuai",
        "alasan": "Explanation of why it matches or doesn't match",
        "data_terbaca_dari_foto": {{
            "tanggal": "extracted date or null",
            "total_amount": number or null,
            "description": "extracted description"
        }}
    }}
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[image, prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Error validating invoice: {e}")
        return {"error": str(e)}
