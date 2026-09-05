from shared.base_client import BaseServiceClient

class GrievanceClient(BaseServiceClient):
    def __init__(self, base_url):
        super().__init__(base_url)

    def get_all_grievances(self):
        return self.request("GET", "/admin/all_grievance")

    def get_grievance_category(self, status, time_range):
        return self.request("GET", f"/admin/grievanceCategory/{status}/{time_range}")

    def get_state_card(self, this_month, this_year, last_month, last_month_year):
        return self.request(
            "GET",
            f"/admin/get_data_statcard/{this_month}/{this_year}/{last_month}/{last_month_year}",
        )

    def get_line_graph_data(self, time_range):
        return self.request("GET", f"/admin/get_line_graph_data/{time_range}")
