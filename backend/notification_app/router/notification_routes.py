from flask import Blueprint

from notification_app.controller.Notification_controller import NotificationController
from shared.auth.decorators import require_self_or_admin, token_required

notification_routes_bp = Blueprint("notification_routes", __name__)


@notification_routes_bp.route("/get_notifications/<int:user_id>", methods=["GET"])
@token_required
def get_notifications(user_id):
    forbidden = require_self_or_admin(user_id)
    if forbidden:
        return forbidden
    return NotificationController.get_notifications(user_id)


@notification_routes_bp.route("/mark_as_read/<int:notification_id>", methods=["POST"])
@token_required
def mark_as_read(notification_id):
    return NotificationController.mark_as_read(notification_id)
