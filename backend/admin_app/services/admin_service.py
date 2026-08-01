from shared.models.admin_model import Admin
from shared.utils.db_utils import db
from werkzeug.security import generate_password_hash,check_password_hash
from shared.models.grievance_model import Grievance
from shared.models.user_model import User
from sqlalchemy import func, text, extract ,case
from datetime import datetime
from dateutil.relativedelta import relativedelta

class AdminService:
    @staticmethod
    def signup(data):
        try:
            hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256', salt_length=8)
            new_admin = Admin(
                full_name=data['full_name'],
                admin_id=data['admin_id'],
                email=data['email'],
                phone=data['phone'],
                password=hashed_password,
                c_id=data['c_id']
            )
            db.session.add(new_admin)
            db.session.commit()
            return True, new_admin
        except Exception as error: 
            db.session.rollback()
            return False, str(error)
        
    @staticmethod
    def login(data):
        try:
            admin = Admin.query.filter_by(admin_id=data['admin_id']).first()
            if admin and check_password_hash(admin.password, data['password']):
                return True, admin
            else:
                return False, "Invalid Admin ID or password"
        except Exception as error:
            db.session.rollback()
            return False, str(error)

    @staticmethod
    def update(full_name, email, phone, admin_id):
        try:
            admin = Admin.query.filter_by(admin_id=admin_id).first()
            if admin:
                admin.full_name = full_name
                admin.email = email
                admin.phone = phone
                db.session.commit()
                return True, admin
            return False, "Admin not found"
        except Exception as error:
            return False, str(error)

    @staticmethod
    def get_grievance_by_category(status,time_range):
        try:
            if time_range and int(time_range) > 0 and status.lower() != "All Complaints".lower(): 
                counts = db.session.query(
                    Grievance.c_id , func.count(Grievance.g_id)
                ).filter(
                        func.lower(Grievance.status) == status.lower(),
                        Grievance.time_stamp >= func.now() - text(f"INTERVAL {int(time_range)} MONTH")
                ).group_by(Grievance.c_id).all()
                return True,counts
            
            elif time_range and int(time_range) > 0 and status.lower() == "All Complaints".lower():
                counts = db.session.query(
                    Grievance.c_id , func.count(Grievance.g_id)
                ).filter(
                        Grievance.time_stamp >= func.now() - text(f"INTERVAL {int(time_range)} MONTH")
                ).group_by(Grievance.c_id).all()
                return True,counts
            
            elif time_range and int(time_range) == 0 and status.lower() == "All Complaints".lower():
                counts = db.session.query(
                    Grievance.c_id , func.count(Grievance.g_id)
                ).group_by(Grievance.c_id).all()
                return True,counts
            
            else:
                counts = db.session.query(
                    Grievance.c_id , func.count(Grievance.g_id)
                ).filter(
                        func.lower(Grievance.status) == status.lower(),
                ).group_by(Grievance.c_id).all()
                return True,counts

        except Exception as err:
            return False, str(err)
    
    @staticmethod
    def get_all_grievance():
        try:
            grievances = db.session.query(
                Grievance.g_id,
                Grievance.title,
                Grievance.c_id,
                Grievance.status,
                Grievance.time_stamp,
                User.student_id,
                User.full_name,
                Grievance.desc,
                User.department
            ).join(
                User, Grievance.u_id == User.u_id
            ).order_by(
                Grievance.time_stamp
            ).all()
            return True, grievances
        except Exception as err:
            return False, err

    @staticmethod
    def get_state_card(this_month,this_year,last_month,last_month_year):
        try:
            this_month_counts = db.session.query(Grievance.status, func.count(Grievance.g_id)).filter(
                extract('month', Grievance.time_stamp) == this_month,
                extract('year', Grievance.time_stamp) == this_year
            ).group_by(Grievance.status).all()

            last_month_counts = db.session.query(
            Grievance.status, func.count(Grievance.g_id)).filter(
                extract('month', Grievance.time_stamp) == last_month,
                extract('year', Grievance.time_stamp) == last_month_year
            ).group_by(Grievance.status).all()
            return True,this_month_counts,last_month_counts
        except Exception as err:
            return False, str(err),None

    @staticmethod
    def get_line_graph_data(time_range):
        try:
            result = db.session.query(
                func.monthname(Grievance.time_stamp).label('month'),
                func.count().label('totalComplaints'),
                func.sum(
                    case((Grievance.status == 'resolved', 1), else_=0)
                ).label('resolved')
                ).filter(
                    Grievance.time_stamp >= func.now() - text(f"INTERVAL {int(time_range)} MONTH")
                ).group_by(
                    func.month(Grievance.time_stamp), func.monthname(Grievance.time_stamp)
                ).order_by(
                    func.month(Grievance.time_stamp)).all()
            return True, result
        except Exception as err:
            return False,str(err)
    
