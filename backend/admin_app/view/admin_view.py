from flask import jsonify
from grievance_app.view.grievance_view import c_id_to_comittee_name
from grievance_app.controller.grievance_controller import commitee_name_to_c_id
from datetime import datetime

class AdminView:
    @staticmethod
    def renderAdmin(admin, token=None):
        payload = {
            "admin_id": admin.admin_id,
            "full_name": admin.full_name,
            "email": admin.email,
            "phone": admin.phone,
            "commmitee": admin.c_id,
            "isAdmin": True,
        }
        if token:
            payload["token"] = token
        return jsonify(payload)

    @staticmethod
    def render_error(error):
        return jsonify({"message": error})

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
    def render_category_wise_grievance(data):
        grievance_counts = {c_id: count for c_id, count in data}

        result = [
            {'category': c_id_to_comittee_name.get(c_id), 'complaints': grievance_counts.get(c_id, 0)}
            for c_id in c_id_to_comittee_name.keys()
        ]
        return jsonify(result)
    
    @staticmethod
    def render_grievance(grievance):
        return {
            "id":grievance.g_id,
            "title": grievance.title,
            "category": c_id_to_comittee_name[grievance.c_id],
            "status": grievance.status,
            "date": grievance.time_stamp.isoformat().split('T')[0],
            "studentId": grievance.student_id,
            "studentName": grievance.full_name,
            "description": grievance.desc,
            "department": grievance.department
        }

    @staticmethod
    def render_grievances(data):
        return jsonify([AdminView.render_grievance(grievance) for grievance in data])
    
    @staticmethod
    def render_line_graph_data(time_range, data):
        month_names = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ]
        db_dict = {month: {'totalComplaints': total, 'resolved': resolved} for month, total, resolved in data}

        current_month = datetime.now().month
        result = []

        for i in range(int(time_range)):
            index = (current_month - i - 1 + 12) % 12
            month_name = month_names[index]
            if month_name in db_dict:
                result.append({
                    'month': month_name,
                    'totalComplaints': db_dict[month_name]['totalComplaints'],
                    'resolved': db_dict[month_name]['resolved']
                })
            else:
                result.append({
                    'month': month_name,
                    'totalComplaints': 0,
                    'resolved': 0
                })
        return jsonify(result)


