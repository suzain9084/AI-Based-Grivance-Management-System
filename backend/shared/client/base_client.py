import requests
from flask import request


class BaseServiceClient:
    def __init__(self, base_url):
        if not base_url:
            raise ValueError("Base URL is required")
        self.base_url = base_url.rstrip("/")

    def _headers(self):
        headers = {}
        auth = request.headers.get("Authorization")
        if auth:
            headers["Authorization"] = auth
        return headers

    def request(self, method, path, **kwargs):
        url = f"{self.base_url}/{path.lstrip('/')}"
        headers = kwargs.pop("headers", {})
        headers.update(self._headers())
        timeout = kwargs.pop("timeout", 60)

        try:
            response = requests.request(
                method=method,
                url=url,
                headers=headers,
                timeout=timeout,
                **kwargs,
            )
        except requests.Timeout:
            return False, "Downstream service timeout"

        except requests.RequestException:
            return False, "Unable to reach downstream service"

        if not response.ok:
            try:
                body = response.json()
            except Exception:
                body = response.text
            if isinstance(body, dict):
                return False, body.get("message") or body.get("error") or body
            return False, body

        if response.content:
            return True, response.json()

        return True, {}
