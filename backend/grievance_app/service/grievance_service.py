from datetime import datetime

from sqlalchemy import case, extract, func, text

from grievance_app.models.grievance_model import Grievance
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
            print("Exception: ", error)
            return False, str(error)

    @staticmethod
    def get_grievances_for_user(user_id):
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
    def get_user_state_card(u_id, this_month, this_year, last_month, last_month_year):
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
    def get_admin_state_card(this_month, this_year, last_month, last_month_year):
        try:
            this_month_counts = (
                db.session.query(Grievance.status, func.count(Grievance.g_id))
                .filter(
                    extract("month", Grievance.time_stamp) == this_month,
                    extract("year", Grievance.time_stamp) == this_year,
                )
                .group_by(Grievance.status)
                .all()
            )

            last_month_counts = (
                db.session.query(Grievance.status, func.count(Grievance.g_id))
                .filter(
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

    @staticmethod
    def get_all_grievances():
        try:
            grievances = Grievance.query.order_by(Grievance.time_stamp.desc()).all()
            return True, grievances
        except Exception as err:
            db.session.rollback()
            return False, str(err)

    @staticmethod
    def get_grievance_by_category(status, time_range):
        try:
            if time_range and int(time_range) > 0 and status.lower() != "all complaints":
                counts = (
                    db.session.query(Grievance.c_id, func.count(Grievance.g_id))
                    .filter(
                        func.lower(Grievance.status) == status.lower(),
                        Grievance.time_stamp
                        >= func.now() - text(f"INTERVAL {int(time_range)} MONTH"),
                    )
                    .group_by(Grievance.c_id)
                    .all()
                )
                return True, counts

            if time_range and int(time_range) > 0 and status.lower() == "all complaints":
                counts = (
                    db.session.query(Grievance.c_id, func.count(Grievance.g_id))
                    .filter(
                        Grievance.time_stamp
                        >= func.now() - text(f"INTERVAL {int(time_range)} MONTH")
                    )
                    .group_by(Grievance.c_id)
                    .all()
                )
                return True, counts

            if time_range and int(time_range) == 0 and status.lower() == "all complaints":
                counts = (
                    db.session.query(Grievance.c_id, func.count(Grievance.g_id))
                    .group_by(Grievance.c_id)
                    .all()
                )
                return True, counts

            counts = (
                db.session.query(Grievance.c_id, func.count(Grievance.g_id))
                .filter(func.lower(Grievance.status) == status.lower())
                .group_by(Grievance.c_id)
                .all()
            )
            return True, counts
        except Exception as err:
            return False, str(err)

    @staticmethod
    def get_line_graph_data(time_range):
        try:
            result = (
                db.session.query(
                    func.monthname(Grievance.time_stamp).label("month"),
                    func.count().label("totalComplaints"),
                    func.sum(case((Grievance.status == "Resolved", 1), else_=0)).label(
                        "resolved"
                    ),
                )
                .filter(
                    Grievance.time_stamp
                    >= func.now() - text(f"INTERVAL {int(time_range)} MONTH")
                )
                .group_by(
                    func.month(Grievance.time_stamp),
                    func.monthname(Grievance.time_stamp),
                )
                .order_by(func.month(Grievance.time_stamp))
                .all()
            )
            return True, result
        except Exception as err:
            return False, str(err)
