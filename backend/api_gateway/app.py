import os
import sys

sys.path.append(os.getcwd())

from flask import Flask, jsonify, make_response, request
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

ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]
PROXY_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]

app = Flask(__name__)
CORS(
    app,
    origins=ALLOWED_ORIGINS,
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=PROXY_METHODS,
)

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per minute"],
    storage_uri="memory://",
)


@app.after_request
def add_cors_headers(response):
    origin = request.headers.get("Origin")
    if origin in ALLOWED_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = ", ".join(PROXY_METHODS)
        response.headers["Vary"] = "Origin"
    return response


@app.before_request
def gateway_auth():
    if request.path.startswith("/socket.io"):
        return None

    if not request.path.startswith("/api/"):
        return None

    if request.method == "OPTIONS":
        return make_response(("", 204))

    if request.path.rstrip("/") == "/api/health":
        return None

    if is_public_route(request.method, request.path):
        return None

    return validate_request_token()


@app.route("/api/health", methods=["GET"])
@limiter.exempt
def health():
    return jsonify({"status": "ok", "service": "api-gateway"}), 200


@app.route("/api/users/<path:path>", methods=PROXY_METHODS)
@limiter.limit("100 per minute")
def users_proxy(path):
    return proxy_to_service(USER_SERVICE_URL, path, request)


@app.route("/api/grievances/<path:path>", methods=PROXY_METHODS)
@limiter.limit("100 per minute")
def grievances_proxy(path):
    return proxy_to_service(GRIEVANCE_SERVICE_URL, path, request)


@app.route("/api/admin/<path:path>", methods=PROXY_METHODS)
@limiter.limit("100 per minute")
def admin_proxy(path):
    return proxy_to_service(ADMIN_SERVICE_URL, path, request)


@app.route("/api/notifications/<path:path>", methods=PROXY_METHODS)
@limiter.limit("100 per minute")
def notifications_proxy(path):
    return proxy_to_service(NOTIFICATION_SERVICE_URL, path, request)


@app.route("/socket.io", defaults={"path": ""}, methods=PROXY_METHODS)
@app.route("/socket.io/", defaults={"path": ""}, methods=PROXY_METHODS)
@app.route("/socket.io/<path:path>", methods=PROXY_METHODS)
def socket_io_proxy(path):
    upstream_path = f"socket.io/{path}" if path else "socket.io/"
    return proxy_to_service(NOTIFICATION_SERVICE_URL, upstream_path, request)

if __name__ == "__main__":
    app.run(debug=FLASK_DEBUG, port=API_GATEWAY_PORT)
