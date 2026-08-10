from shared.utils.db_utils import db

class User(db.Model):
    __tablename__ = 'user'

    u_id = db.Column(db.Integer, primary_key=True,autoincrement=True)
    student_id = db.Column(db.String(100),unique=True)
    full_name = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True)
    phone = db.Column(db.String(15))
    password = db.Column(db.String(500))
    department = db.Column(db.String(500))
    year = db.Column(db.String(10))


