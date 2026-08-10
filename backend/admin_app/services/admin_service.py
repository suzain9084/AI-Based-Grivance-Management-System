from datetime import datetime

from admin_app.clients.grievance_client import GrievanceClient
from admin_app.clients.user_client import UserClient
from admin_app.models.admin_model import Admin
from shared.utils.db_utils import db
from werkzeug.security import check_password_hash, generate_password_hash

C_ID_TO_COMMITTEE_NAME = {
    1: "examination",
    2: "infrastructure",
    3: "general facility",
    4: "research facility",
    5: "journals/literature",
    6: "fellowship",
}


class AdminService:
    grievance_client = GrievanceClient()
    user_client = UserClient()

    @staticmethod
    def signup(data):
        try:
            hashed_password = generate_password_hash(
                data["password"], method="pbkdf2:sha256", salt_length=8
            )
            new_admin = Admin(
                full_name=data["full_name"],
                admin_id=data["admin_id"],
                email=data["email"],
                phone=data["phone"],
                password=hashed_password,
                c_id=data["c_id"],
                created_at=datetime.utcnow(),
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
            admin = Admin.query.filter_by(admin_id=data["admin_id"]).first()
            if admin and check_password_hash(admin.password, data["password"]):
                return True, admin
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
    def get_grievance_by_category(status, time_range):
        return AdminService.grievance_client.get_grievance_category(status, time_range)

    @staticmethod
    def get_all_grievance():
        ok, grievances = AdminService.grievance_client.get_all_grievances()
        if not ok:
            return False, grievances

        u_ids = list({grievance["u_id"] for grievance in grievances})
        users_by_id = {}
        if u_ids:
            ok, users = AdminService.user_client.get_batch_users(u_ids)
            if ok:
                users_by_id = {int(key): value for key, value in users.items()}

        merged = []
        for grievance in grievances:
            user = users_by_id.get(grievance["u_id"], {})
            timestamp = grievance.get("time_stamp", "")
            date = timestamp.split("T")[0] if isinstance(timestamp, str) else ""
            c_id = grievance.get("c_id")
            category = C_ID_TO_COMMITTEE_NAME.get(c_id, str(c_id))

            merged.append(
                {
                    "id": grievance["id"],
                    "title": grievance["title"],
                    "category": category,
                    "status": grievance["status"],
                    "date": date,
                    "studentId": user.get("student_id", "Unknown"),
                    "studentName": user.get("full_name", "Unknown"),
                    "description": grievance.get("desc", ""),
                    "department": user.get("department", "Unknown"),
                }
            )

        return True, merged

    @staticmethod
    def get_state_card(this_month, this_year, last_month, last_month_year):
        return AdminService.grievance_client.get_state_card(
            this_month, this_year, last_month, last_month_year
        )

    @staticmethod
    def get_line_graph_data(time_range):
        return AdminService.grievance_client.get_line_graph_data(time_range)
