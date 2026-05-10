import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

def get_client():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Warning: GEMINI_API_KEY not set in environment.")
    return genai.Client(api_key=api_key)

def generate_financial_statements(transactions_json: str):
    client = get_client()
    prompt = """Kamu adalah seorang Akuntan Profesional dan Analis Keuangan. Saya akan memberikan data transaksi mentah dalam format JSON yang berisi tanggal, nominal, jenis akun, dan deskripsi. Tugasmu adalah memproses data tersebut dan mengklasifikasikannya untuk menghasilkan tiga laporan keuangan:
    1. Balance Sheet (Aset, Kewajiban, Ekuitas)
    2. Profit and Loss Statement (Pendapatan, Beban, Laba Bersih)
    3. Cash Flow Statement (Arus Kas Operasional, Investasi, Pendanaan)
    Keluarkan output HANYA dalam format JSON yang terstruktur agar bisa langsung dibaca oleh sistem Backend saya, tanpa teks penjelasan tambahan.
    """
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=[prompt, f"Data Transaksi:\n{transactions_json}"],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.2
        )
    )
    try:
        return json.loads(response.text)
    except Exception as e:
        print("Failed to parse JSON:", response.text)
        return {"error": "Invalid JSON from AI", "raw": response.text}

def validate_invoice(image_bytes: bytes, mime_type: str, invoice_json: str):
    client = get_client()
    prompt = """Kamu adalah sistem auditor otomatis. Saya akan memberikan sebuah gambar (foto bukti invoice) dan sebuah data JSON yang merupakan rekaman invoice tersebut dari database kami.
    Tugasmu adalah:
    1. Ekstrak informasi dari foto invoice (Nama Vendor, Tanggal, Total Harga, dan Item).
    2. Bandingkan informasi dari foto tersebut dengan data JSON dari database.
    3. Lakukan validasi silang (cross-check). Apakah total harga dan detailnya sama persis?
    Berikan hasil akhir dalam format JSON dengan struktur berikut:
    { "status_validasi": "Sesuai" | "Tidak Sesuai", "alasan": "Penjelasan singkat jika ada perbedaan atau konfirmasi jika cocok", "data_terbaca_dari_foto": { ... } }. Jangan tambahkan format markdown atau teks lain di luar JSON."""
    
    image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=[prompt, f"Data Database:\n{invoice_json}", image_part],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.2
        )
    )
    try:
        return json.loads(response.text)
    except Exception as e:
        print("Failed to parse JSON:", response.text)
        return {"error": "Invalid JSON from AI", "raw": response.text}
