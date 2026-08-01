from flask import jsonify

class UserView:
    @staticmethod
    def renderUser(user, token=None):
        payload = {
            "u_id": user.u_id,
            "student_id": user.student_id,
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "department": user.department,
            "year": user.year,
            "isAdmin": False,
        }
        if token:
            payload["token"] = token
        return jsonify(payload)
    
    @staticmethod
    def render_error(error):
        return jsonify({"message": error})

