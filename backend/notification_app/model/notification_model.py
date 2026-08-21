from shared.utils.db_utils import db


class NotificationModel(db.Model):
    __tablename__ = "notifications"
    notification_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
