import os
import sys

sys.path.append(os.getcwd())

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from api_gateway.auth import is_public_route, validate_request_token
from api_gateway.proxy import proxy_to_service
from dotenv import load_dotenv

load_dotenv()
ADMIN_SERVICE_URL = os.getenv("ADMIN_SERVICE_URL")
API_GATEWAY_PORT = os.getenv("API_GATEWAY_PORT")
FLASK_DEBUG = os.getenv("FLASK_DEBUG")
GRIEVANCE_SERVICE_URL = os.getenv("GRIEVANCE_SERVICE_URL")
NOTIFICATION_SERVICE_URL = os.getenv("NOTIFICATION_SERVICE_URL")
USER_SERVICE_URL = os.getenv("USER_SERVICE_URL")

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per minute"],
    storage_uri="memory://",
)


@app.before_request
def gateway_auth():
    if request.path.startswith("/socket.io"):
        return None

    if not request.path.startswith("/api/"):
        return None

    if request.method == "OPTIONS":
        return None

    if request.path.rstrip("/") == "/api/health":
        return None

    if is_public_route(request.method, request.path):
        return None

    return validate_request_token()


@app.route("/api/health", methods=["GET"])
@limiter.exempt
def health():
    return jsonify({"status": "ok", "service": "api-gateway"}), 200


@app.route("/api/users/<path:path>", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
@limiter.limit("100 per minute")
def users_proxy(path):
    return proxy_to_service(USER_SERVICE_URL, path, request)


@app.route("/api/grievances/<path:path>", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
@limiter.limit("100 per minute")
def grievances_proxy(path):
    return proxy_to_service(GRIEVANCE_SERVICE_URL, path, request)


@app.route("/api/admin/<path:path>", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
@limiter.limit("100 per minute")
def admin_proxy(path):
    return proxy_to_service(ADMIN_SERVICE_URL, path, request)


@app.route("/api/notifications/<path:path>", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
@limiter.limit("100 per minute")
def notifications_proxy(path):
    return proxy_to_service(NOTIFICATION_SERVICE_URL, path, request)


@app.route("/socket.io", defaults={"path": ""}, methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
@app.route("/socket.io/", defaults={"path": ""}, methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
@app.route("/socket.io/<path:path>", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
def socket_io_proxy(path):
    upstream_path = f"socket.io/{path}" if path else "socket.io/"
    return proxy_to_service(NOTIFICATION_SERVICE_URL, upstream_path, request)

if __name__ == "__main__":
    app.run(debug=FLASK_DEBUG, port=API_GATEWAY_PORT)
