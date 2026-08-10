from shared.utils.db_utils import db


class Committee(db.Model):
    __tablename__ = 'committee'

    c_id = db.Column(db.Integer, primary_key=True)
    c_name = db.Column(db.String(100))
    address = db.Column(db.String(200))
    email = db.Column(db.String(100), unique=True)
    phone = db.Column(db.String(15))


