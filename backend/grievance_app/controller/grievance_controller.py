from datetime import datetime
from io import BytesIO

from flask import g, jsonify

from ML_Models.MLmodel import MLmodelsClass
from grievance_app.service.grievance_service import GrievanceService
from grievance_app.view.grievance_view import GrievanceView

commitee_name_to_c_id = {
    "examination": 1,
    "infrastructure": 2,
    "general facility": 3,
    "research facility": 4,
    "journals/literature": 5,
    "fellowship": 6,
}

language_to_code = {
    "hindi": "hi-IN",
    "english": "en-IN",
    "marathi": "mr-IN",
    "gujarati": "gu-IN",
}


class GrievanceController:
    @staticmethod
    def _error(message, status=500):
        return jsonify({"message": message}), status

    @staticmethod
    def add_grievance(data, file):
        u_id = int(data["u_id"])
        if str(g.current_user.get("sub")) != str(u_id):
            return GrievanceController._error("Forbidden", 403)

        language = data["language"]
        desc = data["description"]
        comittee = data["comittee"]

        if data["comittee"] not in commitee_name_to_c_id:
            comittee = MLmodelsClass.grievance_classification(desc, language)

        c_id = commitee_name_to_c_id[comittee]
        title = data["title"]
        audio = file["blob"].read()

        res, grievance = GrievanceService.add_grievance(
            u_id, c_id, desc, title, audio, language
        )
        if res:
            return GrievanceView.render_grievance(grievance)
        return GrievanceController._error(grievance)

    @staticmethod
    def convertToText(file, lan):
        try:
            buffer = BytesIO(file.read())
            res = MLmodelsClass.speechTotext(buffer, language_to_code[lan])
            if res["success"]:
                return GrievanceView.render_text(res["text"]), 200
            return GrievanceController._error(res["error"])
        except Exception as error:
            return GrievanceController._error(str(error))

    @staticmethod
    def get_grievances_for_user(user_id):
        res, grievances = GrievanceService.get_grievances_for_user(user_id)
        if res:
            return GrievanceView.render_grievances(grievances), 200
        return GrievanceController._error(grievances)

    @staticmethod
    def get_audio(g_id):
        res, result = GrievanceService.get_audio(g_id)
        if res:
            grievance = result
            if not g.current_user.get("isAdmin") and str(g.current_user.get("sub")) != str(
                grievance.u_id
            ):
                return GrievanceController._error("Forbidden", 403)
            return GrievanceView.render_audio(grievance.audio), 200
        if res is None:
            return GrievanceController._error(result, 404)
        return GrievanceController._error(result)

    @staticmethod
    def get_user_state_card(u_id):
        now = datetime.utcnow()
        this_month = now.month
        this_year = now.year

        if this_month == 1:
            last_month = 12
            last_month_year = this_year - 1
        else:
            last_month = this_month - 1
            last_month_year = this_year

        res, this_month_counts, last_month_counts = GrievanceService.get_user_state_card(
            u_id, this_month, this_year, last_month, last_month_year
        )
        if res:
            return GrievanceView.render_stat_card(this_month_counts, last_month_counts), 200
        return GrievanceController._error(this_month_counts)

    @staticmethod
    def grievance_kpi_report(u_id):
        res, resolution_rate, avg_response_time_seconds = GrievanceService.grievance_kpi_report(
            u_id
        )
        if res:
            return (
                GrievanceView.render_kpi_report(resolution_rate, avg_response_time_seconds),
                200,
            )
        return GrievanceController._error(resolution_rate)

    @staticmethod
    def get_all_grievances_admin():
        res, grievances = GrievanceService.get_all_grievances()
        if res:
            return jsonify(GrievanceView.render_grievances(grievances)), 200
        return GrievanceController._error(grievances)

    @staticmethod
    def get_grievance_category(status, time_range):
        res, counts = GrievanceService.get_grievance_by_category(status, time_range)
        if res:
            return GrievanceView.render_category_wise_grievance(counts), 200
        return GrievanceController._error(counts)

    @staticmethod
    def get_admin_state_card(this_month, this_year, last_month, last_month_year):
        res, this_month_counts, last_month_counts = GrievanceService.get_admin_state_card(
            this_month, this_year, last_month, last_month_year
        )
        if res:
            return (
                jsonify(
                    {
                        "this_month": [[status, count] for status, count in this_month_counts],
                        "last_month": [[status, count] for status, count in last_month_counts],
                    }
                ),
                200,
            )
        return GrievanceController._error(this_month_counts)

    @staticmethod
    def get_line_graph_data(time_range):
        res, line_graph_data = GrievanceService.get_line_graph_data(time_range)
        if res:
            return (
                jsonify(
                    [
                        [month, total, int(resolved or 0)]
                        for month, total, resolved in line_graph_data
                    ]
                ),
                200,
            )
        return GrievanceController._error(line_graph_data)
