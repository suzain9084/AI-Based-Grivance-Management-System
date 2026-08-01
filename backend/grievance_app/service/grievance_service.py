from datetime import datetime

from sqlalchemy import extract, func, text

from shared.models.grievance_model import Grievance
from shared.utils.db_utils import db


class GrievanceService:
    @staticmethod
    def add_grievance(u_id, c_id, desc, title, audio, language):
        try:
            new_grievance = Grievance(
                u_id=u_id,
                c_id=c_id,
                audio=audio,
                desc=desc,
                status="Pending",
                time_stamp=datetime.now(),
                title=title,
                language=language,
                updated_at=datetime.now(),
            )
            db.session.add(new_grievance)
            db.session.commit()
            return True, new_grievance
        except Exception as error:
            db.session.rollback()
            return False, str(error)

    @staticmethod
    def get_all_grievance(user_id):
        try:
            grievances = Grievance.query.filter_by(u_id=user_id)
            return True, grievances
        except Exception as error:
            return False, str(error)

    @staticmethod
    def get_audio(g_id):
        try:
            grievance = Grievance.query.filter_by(g_id=g_id).first()
            if not grievance:
                return None, "Grievance not found"
            if not grievance.audio:
                return None, "audio not found"
            return True, grievance
        except Exception as err:
            return False, str(err)

    @staticmethod
    def get_state_card(u_id, this_month, this_year, last_month, last_month_year):
        try:
            this_month_counts = (
                db.session.query(Grievance.status, func.count(Grievance.g_id))
                .filter(
                    Grievance.u_id == u_id,
                    extract("month", Grievance.time_stamp) == this_month,
                    extract("year", Grievance.time_stamp) == this_year,
                )
                .group_by(Grievance.status)
                .all()
            )

            last_month_counts = (
                db.session.query(Grievance.status, func.count(Grievance.g_id))
                .filter(
                    Grievance.u_id == u_id,
                    extract("month", Grievance.time_stamp) == last_month,
                    extract("year", Grievance.time_stamp) == last_month_year,
                )
                .group_by(Grievance.status)
                .all()
            )
            return True, this_month_counts, last_month_counts
        except Exception as err:
            return False, str(err), None

    @staticmethod
    def grievance_kpi_report(u_id):
        try:
            total = (
                db.session.query(func.count(Grievance.g_id))
                .filter(Grievance.u_id == u_id)
                .scalar()
            )

            resolved = (
                db.session.query(func.count(Grievance.g_id))
                .filter(Grievance.status == "Resolved", Grievance.u_id == u_id)
                .scalar()
            )

            resolution_rate = (resolved / total) * 100 if total else 0

            avg_response_time_seconds = (
                db.session.query(
                    func.avg(
                        func.timestampdiff(
                            text("SECOND"),
                            Grievance.time_stamp,
                            Grievance.updated_at,
                        )
                    ).label("avg_response_time_seconds")
                )
                .filter(Grievance.status == "Resolved", Grievance.u_id == u_id)
                .scalar()
            )

            avg_response_time_seconds = avg_response_time_seconds or 0
            return True, resolution_rate, avg_response_time_seconds
        except Exception as err:
            return False, str(err), None
