import jwt
from flask import jsonify, request

from shared.auth.jwt_utils import decode_access_token

PUBLIC_ROUTES = {
    ("POST", "/api/users/signup"),
    ("POST", "/api/users/login"),
    ("POST", "/api/admin/signup"),
    ("POST", "/api/admin/login"),
}

def is_public_route(method: str, path: str) -> bool:
    normalized = path.rstrip("/") or "/"
    return (method, normalized) in PUBLIC_ROUTES

def validate_request_token():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"message": "Authentication token is missing"}), 401

    token = auth_header.split(" ", 1)[1]
    try:
        decode_access_token(token)
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token"}), 401

    return None
