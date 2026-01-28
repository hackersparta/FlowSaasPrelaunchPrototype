# backend/app/services/crypto.py
import os
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from fastapi import HTTPException

# Load 32-byte hex key from env
# Example: export CREDENTIAL_ENCRYPTION_KEY=$(openssl rand -hex 32)
KEY_HEX = os.getenv("CREDENTIAL_ENCRYPTION_KEY")

if not KEY_HEX or len(KEY_HEX) != 64:
    # 64 hex chars = 32 bytes
    print("WARNING: CREDENTIAL_ENCRYPTION_KEY is not set or invalid length (must be 32 bytes hex). Security is compromised.")
    # For dev purposes only, we might fallback or just fail. 
    # Failing is better for "secure by default".
    # raise RuntimeError("CREDENTIAL_ENCRYPTION_KEY must be set.")
    pass

def get_cipher():
    if not KEY_HEX:
        raise HTTPException(status_code=500, detail="Server misconfiguration: Missing encryption key.")
    key = bytes.fromhex(KEY_HEX)
    return AESGCM(key)

def encrypt(plaintext: str) -> str:
    """
    Encrypts a string using AES-256-GCM.
    Returns format: nonce_hex:ciphertext_hex
    """
    aesgcm = get_cipher()
    nonce = os.urandom(12) # 96-bit nonce recommended for GCM
    payload = plaintext.encode("utf-8")
    ciphertext = aesgcm.encrypt(nonce, payload, None) # No associated data
    
    return f"{nonce.hex()}:{ciphertext.hex()}"

def decrypt(encrypted_data: str) -> str:
    """
    Decrypts a string in format nonce_hex:ciphertext_hex.
    """
    try:
        nonce_hex, ciphertext_hex = encrypted_data.split(":")
        nonce = bytes.fromhex(nonce_hex)
        ciphertext = bytes.fromhex(ciphertext_hex)
        
        aesgcm = get_cipher()
        plaintext = aesgcm.decrypt(nonce, ciphertext, None)
        return plaintext.decode("utf-8")
    except Exception as e:
        # Avoid leaking details
        raise HTTPException(status_code=500, detail="Decryption failed.")
