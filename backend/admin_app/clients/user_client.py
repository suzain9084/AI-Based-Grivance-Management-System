from config.settings import USER_SERVICE_URL
from shared.base_client import BaseServiceClient


class UserClient(BaseServiceClient):
    def __init__(self):
        super().__init__(USER_SERVICE_URL)

    def get_batch_users(self, u_ids):
        return self.request("POST", "/users/batch", json={"u_ids": u_ids})
