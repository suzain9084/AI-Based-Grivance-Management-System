from flask import Blueprint, jsonify, request

from grievance_app.controller.grievance_controller import GrievanceController
from shared.auth.decorators import admin_required, require_self_or_admin, token_required, user_required

grievance_bp = Blueprint("grievance_bp", __name__)


@grievance_bp.route("/add_grievance", methods=["POST"])
@user_required
def add_grievance():
    return GrievanceController.add_grievance(request.form, request.files)


@grievance_bp.route("/speechToText", methods=["POST"])
@user_required
def speechToText():
    try:
        file = request.files["file"]
        lan = request.form.get("language")
        return GrievanceController.convertToText(file, lan)
    except Exception as error:
        return jsonify({"message": str(error)}), 500


@grievance_bp.route("/get_all_grievance/<int:user_id>", methods=["GET"])
@token_required
def get_user_grievances(user_id):
    forbidden = require_self_or_admin(user_id)
    if forbidden:
        return forbidden
    return GrievanceController.get_grievances_for_user(user_id)


@grievance_bp.route("/get_audio/<int:g_id>", methods=["GET"])
@token_required
def get_audio(g_id):
    return GrievanceController.get_audio(g_id)


@grievance_bp.route("/get_data_statcard/<int:u_id>", methods=["GET"])
@token_required
def get_user_stat_card_data(u_id):
    forbidden = require_self_or_admin(u_id)
    if forbidden:
        return forbidden
    return GrievanceController.get_user_state_card(u_id)


@grievance_bp.route("/kpi_report/<int:u_id>", methods=["GET"])
@token_required
def grievance_kpi_report(u_id):
    forbidden = require_self_or_admin(u_id)
    if forbidden:
        return forbidden
    return GrievanceController.grievance_kpi_report(u_id)


@grievance_bp.route("/admin/all_grievance", methods=["GET"])
@admin_required
def get_all_grievances_admin():
    return GrievanceController.get_all_grievances_admin()


@grievance_bp.route("/admin/grievanceCategory/<status>/<time_range>", methods=["GET"])
@admin_required
def get_grievance_category(status, time_range):
    return GrievanceController.get_grievance_category(status, time_range)


@grievance_bp.route(
    "/admin/get_data_statcard/<int:this_month>/<int:this_year>/<int:last_month>/<int:last_month_year>",
    methods=["GET"],
)
@admin_required
def get_admin_stat_card(this_month, this_year, last_month, last_month_year):
    return GrievanceController.get_admin_state_card(
        this_month, this_year, last_month, last_month_year
    )


@grievance_bp.route("/admin/get_line_graph_data/<time_range>", methods=["GET"])
@admin_required
def get_admin_line_graph_data(time_range):
    return GrievanceController.get_line_graph_data(time_range)

@grievance_bp.route("/admin/update_status/<grievance_id>", methods=["PUT"])
@admin_required
def update_status(grievance_id):
    status = request.json.get("status")
    return GrievanceController.update_status(grievance_id, status)