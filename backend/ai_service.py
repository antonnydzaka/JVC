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

def validate_invoice_batch(image_paths, transactions):
    client = get_client()
    
    images = []
    for path in image_paths:
        try:
            images.append(PIL.Image.open(path))
        except Exception as e:
            print(f"Could not open image {path}: {e}")

    tx_text = "Database Records:\n"
    if transactions:
        for tx in transactions:
            tx_text += f"ID: {tx.id}, Date: {tx.date}, Amount: {tx.amount}, Description: {tx.description}\n"
    else:
        tx_text = "No database records found.\n"

    prompt = f"""
    You are an AI invoice validator. I have provided one or more invoice images.
    Please extract the data from each invoice image and cross-check it sequentially with the following database records:
    
    {tx_text}

    For each invoice image, try to find a matching transaction from the database records based on date, amount, and description.
    Determine if the invoice matches the database record. Return strictly as a JSON array of objects:
    [
        {{
            "filename_or_index": "image 1",
            "matched_transaction_id": number or null if not found,
            "status_validasi": "Sesuai" | "Tidak Sesuai" | "Tidak Ditemukan",
            "alasan": "Explanation of why it matches, doesn't match, or wasn't found",
            "data_terbaca_dari_foto": {{
                "tanggal": "extracted date or null",
                "total_amount": number or null,
                "description": "extracted description"
            }}
        }}
    ]
    """
    
    try:
        contents = images + [prompt]
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=contents,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Error validating invoice batch: {e}")
        return {"error": str(e)}
