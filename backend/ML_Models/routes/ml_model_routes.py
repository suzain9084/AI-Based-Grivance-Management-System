from io import BytesIO

from flask import Blueprint, jsonify, request

from ML_Models.controller.ml_model_controller import MLModelController
from ML_Models.view.ml_view import MLView

ml_model_routes_bp = Blueprint("ml_model_routes", __name__)


@ml_model_routes_bp.route("/speech-to-text", methods=["POST"])
def speech_to_text():
    file = request.files.get("file")
    lan = request.form.get("lan")
    if not file or not lan:
        return jsonify({"success": False, "text": "", "error": "file and lan are required"}), 400

    buffer = BytesIO(file.read())
    result = MLModelController.speechTotext(buffer, lan)
    return MLView.speech_to_text(result)


@ml_model_routes_bp.route("/committe-classification", methods=["POST"])
def committe_classification():
    data = request.get_json(silent=True) or {}
    grievance_description = data.get("grievance_description")
    language = data.get("language")
    if not grievance_description or not language:
        return jsonify(
            {"success": False, "comittee": None, "error": "grievance_description and language are required"}
        ), 400

    committee = MLModelController.grievance_classification(grievance_description, language)
    if committee is None:
        return MLView.committee_classification(False, error="Classification failed")
    return MLView.committee_classification(True, committee=committee)
