from shared.utils.db_utils import db
from datetime import datetime
from sqlalchemy.dialects.mysql import LONGBLOB
from grievance_app.models.commitee_model import Committee
from sqlalchemy.orm import relationship


class Grievance(db.Model):
    __tablename__ = 'grievance'

    g_id = db.Column(db.Integer, primary_key=True,autoincrement=True)
    status = db.Column(db.String(50))
    time_stamp = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime,default=datetime.utcnow)
    title = db.Column(db.String(400))
    desc = db.Column(db.Text)
    audio = db.Column(LONGBLOB)
    language = db.Column(db.String(100))
    u_id = db.Column(db.Integer, nullable=False)
    c_id = db.Column(db.Integer, db.ForeignKey('committee.c_id'), nullable=False)

    committee = relationship('Committee', backref='grievances', foreign_keys=[c_id])
