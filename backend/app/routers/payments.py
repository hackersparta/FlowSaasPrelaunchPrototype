# backend/app/routers/payments.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Annotated
from ..database import get_db
from ..models import User
from ..routers.auth import get_current_user
from ..services.payment_service import payment_service
from ..services.credit_ledger import record_transaction
import uuid

router = APIRouter(prefix="/payments", tags=["payments"])

class CreateOrderRequest(BaseModel):
    package_id: str  # e.g., "100", "500", "1000"

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    credits: int

# Define credit packages
CREDIT_PACKAGES = {
    "100": {"credits": 100, "price": 100},
    "500": {"credits": 500, "price": 450},
    "1000": {"credits": 1000, "price": 850},
    "2500": {"credits": 2500, "price": 2000},
}

@router.get("/packages")
def get_packages():
    """Return available credit packages"""
    return {
        "packages": [
            {"id": k, "credits": v["credits"], "price": v["price"]}
            for k, v in CREDIT_PACKAGES.items()
        ]
    }

@router.post("/create-order")
def create_order(
    request: CreateOrderRequest,
    current_user: Annotated[User, Depends(get_current_user)]
):
    """Create a Razorpay order for credit purchase"""
    if request.package_id not in CREDIT_PACKAGES:
        raise HTTPException(status_code=400, detail="Invalid package ID")
    
    package = CREDIT_PACKAGES[request.package_id]
    receipt = f"credits_{current_user.id}_{uuid.uuid4().hex[:8]}"
    
    order = payment_service.create_order(
        amount_inr=package["price"],
        receipt=receipt
    )
    
    return {
        "order_id": order["id"],
        "amount": order["amount"],
        "currency": order["currency"],
        "credits": package["credits"]
    }

@router.post("/verify")
def verify_payment(
    request: VerifyPaymentRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """Verify payment and add credits to user account"""
    
    # Verify signature
    is_valid = payment_service.verify_payment_signature(
        request.razorpay_order_id,
        request.razorpay_payment_id,
        request.razorpay_signature
    )
    
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid payment signature")
    
    # Add credits
    try:
        new_balance = record_transaction(
            user_id=current_user.id,
            amount=request.credits,
            description=f"Credit Purchase - Razorpay {request.razorpay_payment_id}",
            reference_id=request.razorpay_payment_id,
            db=db
        )
        
        return {
            "success": True,
            "credits_added": request.credits,
            "new_balance": new_balance
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add credits: {str(e)}")
