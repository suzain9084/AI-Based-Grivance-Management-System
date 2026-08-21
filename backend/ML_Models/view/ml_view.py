from flask import jsonify


class MLView:
    @staticmethod
    def speech_to_text(result):
        return jsonify(result)

    @staticmethod
    def committee_classification(success, committee=None, error=None):
        if success:
            return jsonify({"success": True, "comittee": committee, "error": None})
        return jsonify({"success": False, "comittee": None, "error": error}), 500
