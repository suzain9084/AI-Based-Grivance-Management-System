from flask import request
from flask_socketio import disconnect, join_room, leave_room

from shared.auth.jwt_utils import decode_access_token


class ConnectionManager:
    @staticmethod
    def _get_user_id():
        auth = request.headers.get("Authorization") or request.args.get("token")
        if not auth:
            return None
        if auth.startswith("Bearer "):
            auth = auth.split(" ", 1)[1]
        try:
            return decode_access_token(auth).get("sub")
        except Exception:
            return None

    @staticmethod
    def on_connect():
        user_id = ConnectionManager._get_user_id()
        if not user_id:
            disconnect()
            return False
        join_room(f"user_{user_id}")

    @staticmethod
    def on_disconnect():
        user_id = ConnectionManager._get_user_id()
        if user_id:
            leave_room(f"user_{user_id}")
