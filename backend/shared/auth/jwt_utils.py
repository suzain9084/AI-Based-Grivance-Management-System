from datetime import datetime, timedelta, timezone

import jwt

from config.settings import JWT_EXPIRY_HOURS, JWT_SECRET


def create_access_token(user_id, role, is_admin=False):
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "role": role,
        "isAdmin": is_admin,
        "iat": now,
        "exp": now + timedelta(hours=JWT_EXPIRY_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def decode_access_token(token):
    return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
