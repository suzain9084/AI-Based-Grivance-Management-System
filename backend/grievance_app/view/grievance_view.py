from flask import jsonify ,send_file, make_response
from io import BytesIO
from urllib.parse import urlparse

c_id_to_comittee_name = {
    1 : "examination",
    2 : "infrastructure", 
    3 : "general facility",
    4 : "research facility",
    5 : "journals/literature",
    6 : "fellowship"
}

class GrievanceView:
    @staticmethod
    def render_grievance(grievance):
        return {
            "id": grievance.g_id,
            "title": grievance.title,
            "desc": grievance.desc,
            "language": grievance.language,
            "u_id": grievance.u_id,
            "c_id": c_id_to_comittee_name[grievance.c_id],
            "status": grievance.status,
            "time_stamp": grievance.time_stamp,
        }

    @staticmethod
    def render_grievances(grievances):
        return [GrievanceView.render_grievance(grievance) for grievance in grievances]

    @staticmethod
    def render_text(text):
        return jsonify(text)
    
    @staticmethod
    def render_audio(blob_data):
        try:
            audio_stream = BytesIO(blob_data)
            response = make_response(send_file(audio_stream, mimetype="audio/mpeg"))
            response.headers["Content-Disposition"] = "inline; filename=audio.mp3"
            return response
        except Exception as e:
            print(f"Error processing audio data: {e}")
            return None

    @staticmethod
    def render_stat_card(this_month_counts, last_month_counts):
        this_month_data = {status: count for status, count in this_month_counts}
        last_month_data = {status: count for status, count in last_month_counts}

        this_total = sum(this_month_data.values())
        last_total = sum(last_month_data.values())

        result = [
            {
                "title": "Total Complaints",
                "value": this_total,
                "trend": this_total - last_total,
            },
            {
                "title": "Resolved",
                "value": this_month_data.get("Resolved", 0),
                "trend": this_month_data.get("Resolved", 0) - last_month_data.get("Resolved", 0),
            },
            {
                "title": "Pending",
                "value": this_month_data.get("Pending", 0),
                "trend": this_month_data.get("Pending", 0) - last_month_data.get("Pending", 0),
            },
        ]
        return jsonify(result)

    @staticmethod
    def render_kpi_report(resolution_rate, avg_response_time_seconds):
        result = [
            {
                "title": "Complaints Resolution Rate (%)",
                "value": resolution_rate,
            },
            {
                "title": "Average Response Time (in seconds)",
                "value": avg_response_time_seconds,
            },
        ]
        return jsonify(result)

