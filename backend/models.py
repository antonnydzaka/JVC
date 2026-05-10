from sqlalchemy import Column, Integer, String, Float, Text, Date
from database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, index=True)
    amount = Column(Float)
    account_type = Column(String)  # Asset, Liability, Equity, Revenue, Expense
    description = Column(String)

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    vendor_name = Column(String, index=True)
    date = Column(String)
    total_amount = Column(Float)
    items_json = Column(Text) # Stored as JSON string
    status = Column(String, default="Pending") # Pending, Sesuai, Tidak Sesuai
    validation_reason = Column(Text, nullable=True)
