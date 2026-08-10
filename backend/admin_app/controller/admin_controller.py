from flask import jsonify
from shared.auth.jwt_utils import create_access_token
from admin_app.models.admin_model import Admin
from admin_app.services.admin_service import AdminService
from admin_app.view.admin_view import AdminView
# from user_app.view.user_view import UserView


class AdminController:
    @staticmethod
    def signup(data):
        if Admin.query.filter_by(admin_id=data["admin_id"]).first() or Admin.query.filter_by(
            email=data["email"]
        ).first():
            return AdminView.render_error("Admin ID or Email already exists"), 400

        res, admin = AdminService.signup(data)
        if res:
            return AdminView.renderAdmin(admin), 201
        return AdminView.render_error(admin), 500

    @staticmethod
    def login(data):
        res, admin = AdminService.login(data)
        if res:
            token = create_access_token(admin.admin_id, role="admin", is_admin=True)
            return AdminView.renderAdmin(admin, token=token), 200
        return AdminView.render_error(admin), 401

    @staticmethod
    def update(data):
        res, admin = AdminService.update(
            data["full_name"], data["email"], data["phone"], data["admin_id"]
        )
        if res:
            return AdminView.renderAdmin(admin), 200
        return AdminView.render_error(admin), 500

    @staticmethod
    def get_grievance_by_category(status, time_range):
        res, data = AdminService.get_grievance_by_category(status, time_range)
        if res:
            return jsonify(data), 200
        return AdminView.render_error(data), 500

    @staticmethod
    def get_all_grievance():
        res, data = AdminService.get_all_grievance()
        if res:
            return AdminView.render_grievances(data)
        return AdminView.render_error(data), 500

    @staticmethod
    def get_stat_card_data():
        from datetime import datetime

        now = datetime.utcnow()
        this_month = now.month
        this_year = now.year

        if this_month == 1:
            last_month = 12
            last_month_year = this_year - 1
        else:
            last_month = this_month - 1
            last_month_year = this_year

        res, data = AdminService.get_state_card(
            this_month, this_year, last_month, last_month_year
        )
        if res:
            return AdminView.render_stat_card(data["this_month"], data["last_month"]), 200
        return AdminView.render_error(data), 500

    @staticmethod
    def get_line_graph_data(time_range):
        res, data = AdminService.get_line_graph_data(time_range)
        if res:
            return AdminView.render_line_graph_data(time_range, data), 200
        return AdminView.render_error(data), 500
