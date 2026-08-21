from datetime import datetime

from notification_app.model.notification_model import NotificationModel
from shared.utils.db_utils import db

_socketio = None


def init_socketio(socketio):
    global _socketio
    _socketio = socketio


def _serialize(notification):
    return {
        "notification_id": notification.notification_id,
        "user_id": notification.user_id,
        "title": notification.title,
        "message": notification.message,
        "created_at": notification.created_at.isoformat(),
        "is_read": notification.is_read,
    }


class NotificationService:
    @staticmethod
    def get_notifications(user_id):
        notifications = NotificationModel.query.filter_by(user_id=user_id).all()
        return {
            "message": "Notifications fetched successfully",
            "data": [_serialize(n) for n in notifications],
        }

    @staticmethod
    def mark_as_read(notification_id):
        notification = NotificationModel.query.get(notification_id)
        if not notification:
            return {"message": "Notification not found", "error": True}
        notification.is_read = True
        db.session.commit()
        return {
            "message": "Notification marked as read successfully",
            "data": _serialize(notification),
        }

    @staticmethod
    def add_notification(data):
        notification = NotificationModel(
            user_id=data["user_id"],
            title=data["title"],
            message=data["message"],
            created_at=datetime.utcnow(),
            is_read=False,
        )
        db.session.add(notification)
        db.session.commit()
        return {
            "message": "Notification added successfully",
            "data": _serialize(notification),
        }

    @staticmethod
    def send_notification(data, to):
        room = f"user_{to}"
        if _socketio:
            try:
                _socketio.emit("notification", data, room=room)
                return {"message": "Notification sent successfully"}
            except Exception:
                pass
        NotificationService.add_notification(data)
        return {"message": "Notification stored successfully"}
