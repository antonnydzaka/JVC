from sqlalchemy import Column, Integer, String, Float
from database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, index=True)
    amount = Column(Float)
    account_type = Column(String)
    description = Column(String)
