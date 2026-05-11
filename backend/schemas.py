from pydantic import BaseModel

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
        from_attributes = True
