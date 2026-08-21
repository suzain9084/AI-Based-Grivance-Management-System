from flask import jsonify

from notification_app.services.notification_service import NotificationService


class NotificationController:
    @staticmethod
    def get_notifications(user_id):
        res = NotificationService.get_notifications(user_id)
        return jsonify(res), 200

    @staticmethod
    def mark_as_read(notification_id):
        res = NotificationService.mark_as_read(notification_id)
        if res.get("error"):
            return jsonify(res), 404
        return jsonify(res), 200

    @staticmethod
    def add_notification(data):
        res = NotificationService.add_notification(data)
        return jsonify(res), 201

    @staticmethod
    def send_notification(data, to):
        res = NotificationService.send_notification(data, to)
        return jsonify(res), 200
