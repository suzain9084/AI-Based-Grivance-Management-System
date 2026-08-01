from shared.auth.jwt_utils import create_access_token
from shared.models.user_model import User
from user_app.services.user_service import UserService
from user_app.view.user_view import UserView


class UserController:
    @staticmethod
    def signup(data):
        if User.query.filter_by(student_id=data["student_id"]).first() or User.query.filter_by(
            email=data["email"]
        ).first():
            return UserView.render_error("Student ID or Email already exists"), 400

        res, user = UserService.signup(data)
        if res:
            token = create_access_token(user.u_id, role="user", is_admin=False)
            return UserView.renderUser(user, token=token), 201
        return UserView.render_error(user), 500

    @staticmethod
    def login(data):
        res, user = UserService.login(data)
        if res:
            token = create_access_token(user.u_id, role="user", is_admin=False)
            return UserView.renderUser(user, token=token), 200
        return UserView.render_error(user), 401

    @staticmethod
    def update(data):
        res, user = UserService.update(
            data["full_name"], data["email"], data["phone"], data["u_id"]
        )
        if res:
            return UserView.renderUser(user), 200
        return UserView.render_error(user), 500
