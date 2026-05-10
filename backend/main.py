from fastapi import FastAPI, Depends, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json
import uvicorn

import models, schemas, database, ai_service

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Financial Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev purposes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def init_db():
    db = database.SessionLocal()
    if db.query(models.Transaction).count() == 0:
        # Seed 1 dummy transaction
        sample_txs = [
            models.Transaction(date="2023-10-01", amount=1500.0, account_type="Expense", description="Purchase Laptop from Tech Store"),
        ]
        db.add_all(sample_txs)
        
        # Seed dummy invoices
        sample_inv_valid = models.Invoice(
            vendor_name="Tech Store",
            date="2023-10-01",
            total_amount=1500.0,
            items_json='[{"name": "Laptop", "qty": 1, "price": 1500.0}]',
            status="Pending"
        )
        sample_inv_invalid = models.Invoice(
            vendor_name="Office Supply Co",
            date="2023-10-05",
            total_amount=300.0,
            items_json='[{"name": "Printer Ink", "qty": 5, "price": 60.0}]',
            status="Pending"
        )
        db.add_all([sample_inv_valid, sample_inv_invalid])
        db.commit()
    db.close()

# Run DB init on startup
init_db()

@app.get("/")
def read_root():
    return {"message": "Welcome to Financial Dashboard API. Visit /docs for Swagger UI."}

@app.get("/api/financial-report")
def get_financial_report(db: Session = Depends(database.get_db)):
    transactions = db.query(models.Transaction).all()
    tx_data = [
        {"id": t.id, "date": t.date, "amount": t.amount, "account_type": t.account_type, "description": t.description}
        for t in transactions
    ]
    
    if not tx_data:
        raise HTTPException(status_code=404, detail="No transactions found")

    try:
        report_json = ai_service.generate_financial_statements(json.dumps(tx_data))
        return report_json
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/invoice/validate")
async def validate_invoice(
    invoice_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db)
):
    invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    invoice_data = {
        "id": invoice.id,
        "vendor_name": invoice.vendor_name,
        "date": invoice.date,
        "total_amount": invoice.total_amount,
        "items": json.loads(invoice.items_json)
    }

    try:
        image_bytes = await file.read()
        validation_result = ai_service.validate_invoice(image_bytes, file.content_type, json.dumps(invoice_data))
        
        if "status_validasi" in validation_result:
            invoice.status = validation_result["status_validasi"]
            invoice.validation_reason = validation_result.get("alasan", "")
            db.commit()
            
        return validation_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/invoices")
def get_invoices(db: Session = Depends(database.get_db)):
    return db.query(models.Invoice).all()

@app.get("/api/transactions")
def get_transactions(db: Session = Depends(database.get_db)):
    return db.query(models.Transaction).order_by(models.Transaction.id.desc()).all()

@app.post("/api/transactions")
def create_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(database.get_db)):
    db_transaction = models.Transaction(**transaction.model_dump())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@app.delete("/api/transactions/{transaction_id}")
def delete_transaction(transaction_id: int, db: Session = Depends(database.get_db)):
    transaction = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(transaction)
    db.commit()
    return {"ok": True}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
