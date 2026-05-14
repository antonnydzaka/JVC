from fastapi import FastAPI, Depends, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
import shutil
import pandas as pd
import io

import models, schemas, database, ai_service

# Create DB tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Financial Dashboard API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/api/transactions", response_model=list[schemas.Transaction])
def read_transactions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    transactions = db.query(models.Transaction).offset(skip).limit(limit).all()
    return transactions

@app.post("/api/transactions", response_model=schemas.Transaction)
def create_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(get_db)):
    db_transaction = models.Transaction(**transaction.model_dump())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@app.delete("/api/transactions/{transaction_id}")
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    db_transaction = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(db_transaction)
    db.commit()
    return {"message": "Transaction deleted"}

@app.get("/api/financial-report")
def get_financial_report(db: Session = Depends(get_db)):
    transactions = db.query(models.Transaction).all()
    if not transactions:
        raise HTTPException(status_code=404, detail="No transactions available to generate report")
    
    report = ai_service.generate_financial_report(transactions)
    if "error" in report:
        raise HTTPException(status_code=500, detail=report["error"])
    return report

@app.post("/api/transactions/upload")
async def upload_transactions(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(content))
        elif file.filename.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(io.BytesIO(content))
        else:
            raise HTTPException(status_code=400, detail="Invalid file format. Please upload CSV or Excel.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")
    
    df.columns = df.columns.str.lower().str.strip()
    
    required = {"date", "amount", "account_type", "description"}
    if not required.issubset(set(df.columns)):
        raise HTTPException(status_code=400, detail=f"Missing required columns. Expected: {required}")
    
    count = 0
    for _, row in df.iterrows():
        try:
            tx = models.Transaction(
                date=str(row['date']).split(' ')[0], # Ensure just date part if datetime
                amount=float(row['amount']),
                account_type=str(row['account_type']).strip(),
                description=str(row['description']).strip()
            )
            db.add(tx)
            count += 1
        except Exception as e:
            # Skip invalid rows or handle error
            pass
            
    db.commit()
    return {"message": f"Successfully uploaded {count} transactions."}

@app.post("/api/invoice/validate")
async def validate_invoice_upload(files: list[UploadFile] = File(...), db: Session = Depends(get_db)):
    transactions = db.query(models.Transaction).all()
    
    temp_files = []
    try:
        for file in files:
            temp_path = f"temp_{file.filename}"
            with open(temp_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            temp_files.append(temp_path)
            
        result = ai_service.validate_invoice_batch(temp_files, transactions)
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        return result
    finally:
        for path in temp_files:
            if os.path.exists(path):
                os.remove(path)

# --- Static File Serving for Frontend (Important for Cloud Run Deployment) ---

# Get the directory of the current file (backend folder)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Define the path to the frontend build folder (dist)
FRONTEND_DIST_DIR = os.path.join(BASE_DIR, "..", "frontend", "dist")

# Only mount static files if the directory exists (to prevent errors during local dev if not built yet)
if os.path.isdir(FRONTEND_DIST_DIR):
    # Mount the /assets directory for CSS and JS
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST_DIR, "assets")), name="assets")
    
    # Catch-all route to serve the React index.html for client-side routing
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Prevent catching /api routes by mistake
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API route not found")
            
        potential_file_path = os.path.join(FRONTEND_DIST_DIR, full_path)
        if os.path.isfile(potential_file_path):
            return FileResponse(potential_file_path)
        
        # Otherwise, serve the React index.html
        return FileResponse(os.path.join(FRONTEND_DIST_DIR, "index.html"))
