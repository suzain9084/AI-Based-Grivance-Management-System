from flask import Blueprint, request

from admin_app.controller.admin_controller import AdminController
from shared.auth.decorators import admin_required, require_self_or_admin

admin_bp = Blueprint("admin_bp", __name__)


@admin_bp.route("/signup", methods=["POST"])
def signup():
    return AdminController.signup(request.json)


@admin_bp.route("/login", methods=["POST"])
def login():
    return AdminController.login(request.json)


@admin_bp.route("/update", methods=["PUT"])
@admin_required
def update():
    data = request.json
    forbidden = require_self_or_admin(data.get("admin_id"))
    if forbidden:
        return forbidden
    return AdminController.update(data)


@admin_bp.route("/grievanceCategory/<status>/<time_range>")
@admin_required
def get_grievance_by_category(status, time_range):
    return AdminController.get_grievance_by_category(status, time_range)


@admin_bp.route("/get_all_grievance", methods=["GET"])
@admin_required
def get_all_grievance():
    return AdminController.get_all_grievance()


@admin_bp.route("/get_data_statcard", methods=["GET"])
@admin_required
def get_stat_card_data():
    return AdminController.get_stat_card_data()


@admin_bp.route("/get_line_graph_data/<time_range>", methods=["GET"])
@admin_required
def get_line_graph_data(time_range):
    return AdminController.get_line_graph_data(time_range)

@admin_bp.route("/update_status/<grievance_id>", methods=["PUT"])
@admin_required
def update_status(grievance_id):
    status = (request.json or {}).get("status")
    return AdminController.update_status(grievance_id, status)