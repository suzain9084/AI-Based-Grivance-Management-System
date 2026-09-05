from shared.base_client import BaseServiceClient

class UserClient(BaseServiceClient):
    def __init__(self, base_url):
        super().__init__(base_url)

    def get_batch_users(self, u_ids):
        return self.request("POST", "/users/batch", json={"u_ids": u_ids})
