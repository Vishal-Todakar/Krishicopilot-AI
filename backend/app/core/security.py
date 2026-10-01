import hashlib
import hmac
import base64
import json
import time
from datetime import datetime, timedelta
from typing import Optional, Any
from app.core.config import settings

def hash_password(password: str) -> str:
    """Create a secure salt & hash for passwords."""
    salt = "krishi_salt_2026"
    return hashlib.sha256((salt + password).encode("utf-8")).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hashed representation."""
    return hash_password(plain_password) == hashed_password

def create_access_token(subject: str | Any, expires_delta: Optional[timedelta] = None) -> str:
    """Generate JWT token with claims."""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": str(subject),
        "exp": int(expire.timestamp()),
        "iat": int(time.time())
    }
    
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    
    signature_bytes = hmac.new(
        settings.JWT_SECRET.encode(),
        f"{header_b64}.{payload_b64}".encode(),
        hashlib.sha256
    ).digest()
    sig_b64 = base64.urlsafe_b64encode(signature_bytes).decode().rstrip("=")
    
    return f"{header_b64}.{payload_b64}.{sig_b64}"

def decode_access_token(token: str) -> Optional[dict]:
    """Decode and verify JWT signature and expiry."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        
        # Verify signature
        expected_sig = base64.urlsafe_b64encode(
            hmac.new(
                settings.JWT_SECRET.encode(),
                f"{header_b64}.{payload_b64}".encode(),
                hashlib.sha256
            ).digest()
        ).decode().rstrip("=")
        
        if not hmac.compare_digest(sig_b64, expected_sig):
            return None
            
        # Decode payload
        rem = len(payload_b64) % 4
        if rem > 0:
            payload_b64 += "=" * (4 - rem)
        payload = json.loads(base64.urlsafe_b64decode(payload_b64.encode()).decode())
        
        if payload.get("exp", 0) < int(time.time()):
            return None  # expired
            
        return payload
    except Exception:
        return None
