from pydantic import BaseModel
from typing import Optional, List, Any

class TransactionBase(BaseModel):
    date: str
    amount: float
    account_type: str
    description: str

class TransactionCreate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: int

    class Config:
        orm_mode = True
        from_attributes = True

class InvoiceBase(BaseModel):
    vendor_name: str
    date: str
    total_amount: float
    items_json: str

class InvoiceCreate(InvoiceBase):
    pass

class Invoice(InvoiceBase):
    id: int
    status: str
    validation_reason: Optional[str] = None

    class Config:
        orm_mode = True
        from_attributes = True
