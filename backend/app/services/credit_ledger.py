# backend/app/services/credit_ledger.py
from sqlalchemy.orm import Session
from ..models import User, CreditTransaction
from fastapi import HTTPException
from uuid import UUID

def get_user_balance(user_id: UUID, db: Session) -> int:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user.credits_balance

def record_transaction(user_id: UUID, amount: int, description: str, reference_id: str, db: Session):
    """
    Records a transaction and updates the user's cached balance atomically.
    Amount: Positive for add, Negative for deduct.
    """
    user = db.query(User).filter(User.id == user_id).with_for_update().first() # Lock row
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if amount < 0 and user.credits_balance + amount < 0:
        raise HTTPException(status_code=402, detail="Insufficient credits")

    user.credits_balance += amount
    
    transaction = CreditTransaction(
        user_id=user_id,
        amount=amount,
        description=description,
        reference_id=reference_id,
        balance_after=user.credits_balance
    )
    
    db.add(transaction)
    db.commit()
    db.refresh(user)
    return user.credits_balance

def deduct_credits_for_execution(user_id: UUID, cost: int, execution_id: UUID, db: Session):
    return record_transaction(
        user_id=user_id,
        amount=-cost,
        description="Workflow Execution",
        reference_id=str(execution_id),
        db=db
    )
