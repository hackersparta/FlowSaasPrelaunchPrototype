# backend/app/guards/credit_check.py
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.credit_ledger import get_user_balance
from uuid import UUID

def verify_sufficient_credits(user_id: UUID, cost: int, db: Session = Depends(get_db)):
    """
    Verifies if the user has enough credits for the operation.
    Raises HTTPException if insufficient.
    """
    balance = get_user_balance(user_id, db)
    if balance < cost:
        raise HTTPException(status_code=402, detail="Insufficient credits")
    return True
