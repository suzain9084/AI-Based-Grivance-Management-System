from shared.utils.db_utils import db

class Admin(db.Model):
    __tablename__ = 'admin'

    admin_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(20),nullable=False)
    password = db.Column(db.String(255), nullable=False)
    c_id = db.Column(db.Integer,nullable=False)
    created_at = db.Column(db.DateTime,nullable=False)

