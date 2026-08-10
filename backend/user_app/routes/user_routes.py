from flask import Blueprint, request

from shared.auth.decorators import user_required, require_self_or_admin, admin_required
from user_app.controller.user_controller import UserController

user_bp = Blueprint("user_bp", __name__)


@user_bp.route("/signup", methods=["POST"])
def signup():
    return UserController.signup(request.json)


@user_bp.route("/login", methods=["POST"])
def login():
    return UserController.login(request.json)


@user_bp.route("/update", methods=["PUT"])
@user_required
def update():
    data = request.json
    forbidden = require_self_or_admin(data.get("u_id"))
    if forbidden:
        return forbidden
    return UserController.update(data)

@user_bp.route("/users/batch", methods=["POST"])
@admin_required
def get_batch_users():
    return UserController.get_batch_users(request.json)