# backend/app/services/payment_service.py
import razorpay
import os
from fastapi import HTTPException

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

class PaymentService:
    def __init__(self):
        self.client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
    
    def create_order(self, amount_inr: int, receipt: str):
        """
        Create a Razorpay order.
        Amount is in INR (will be converted to paise internally).
        """
        try:
            order_data = {
                "amount": amount_inr * 100,  # Convert to paise
                "currency": "INR",
                "receipt": receipt,
                "payment_capture": 1  # Auto capture
            }
            order = self.client.order.create(data=order_data)
            return order
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")
    
    def verify_payment_signature(self, razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str):
        """
        Verify the payment signature from Razorpay callback.
        """
        try:
            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }
            self.client.utility.verify_payment_signature(params_dict)
            return True
        except razorpay.errors.SignatureVerificationError:
            return False

payment_service = PaymentService()
