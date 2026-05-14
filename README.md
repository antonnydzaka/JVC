# Financial Dashboard (AI-Powered)

This is a full-stack application built with FastAPI (Python) and React (Vite) that utilizes Gemini AI for automated financial reporting and invoice validation.

## Prerequisites
- Python 3.10+
- Node.js 18+
- Gemini API Key

## Setup Instructions

### 1. Configure API Key
Open `backend/.env` and replace `your_api_key_here` with your actual Google Gemini API key:
```env
GEMINI_API_KEY=AIzaSy...
```

### 2. Start the Backend
Open a terminal and run the following commands:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
.\venv\Scripts\python.exe -m uvicorn main:app --reload
```
The API will run at `http://localhost:8000`. Swagger UI is available at `http://localhost:8000/docs`.

### 3. Start the Frontend
Open a new terminal and run:
```powershell
cd frontend
npm install
npm.cmd run dev
```
Open the local URL provided by Vite (usually `http://localhost:5173`) in your browser to view the application.

## Features
- **Financial Reports**: Fetches raw transactions from the SQLite database and uses Gemini AI to compile Balance Sheet, Profit & Loss, and Cash Flow statements. Displayed dynamically with Chart.js.
- **Invoice Validation**: Upload an invoice photo. The backend uses Gemini Vision to extract details from the image, cross-references it with database records, and outputs a validation status (Sesuai/Tidak Sesuai) and reasoning.

https://financial-dashboard-427576652100.asia-southeast1.run.app
