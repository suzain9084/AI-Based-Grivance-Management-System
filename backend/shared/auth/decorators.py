from functools import wraps
import os
import jwt
from flask import g, jsonify, request

from dotenv import load_dotenv
load_dotenv()
JWT_SECRET = os.getenv("JWT_SECRET")

def _unauthorized(message="Authentication token is missing"):
    return jsonify({"message": message}), 401


def _forbidden(message="Forbidden"):
    return jsonify({"message": message}), 403


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return _unauthorized()

        token = auth_header.split(" ", 1)[1]
        try:
            g.current_user = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return _unauthorized("Token has expired")
        except jwt.InvalidTokenError:
            return _unauthorized("Invalid token")

        return f(*args, **kwargs)

    return decorated


def admin_required(f):
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if not g.current_user.get("isAdmin"):
            return _forbidden("Admin access required")
        return f(*args, **kwargs)

    return decorated


def user_required(f):
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if g.current_user.get("role") != "user":
            return _forbidden("User access required")
        return f(*args, **kwargs)

    return decorated


def require_self_or_admin(user_id):
    if g.current_user.get("isAdmin"):
        return None
    if str(g.current_user.get("sub")) != str(user_id):
        return _forbidden()
    return None
