import os
from pathlib import Path

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parent.parent

# Optional per-service DB overrides in backend/.env; falls back to CONNECTION_STRING.
SERVICE_CONNECTION_ENV = {
    "user_app": "USER_CONNECTION_STRING",
    "grievance_app": "GRIEVANCE_CONNECTION_STRING",
    "admin_app": "ADMIN_CONNECTION_STRING",
    "notification_app": "NOTIFICATION_CONNECTION_STRING",
}


def load_service_env():
    """Load all secrets from backend/.env only."""
    load_dotenv(BACKEND_DIR / ".env")


CONNECTION_STRING = None
JWT_SECRET = None
JWT_EXPIRY_HOURS = 24
USER_SERVICE_PORT = 5000
GRIEVANCE_SERVICE_PORT = 5001
ADMIN_SERVICE_PORT = 5002
ML_SERVICE_PORT = 5003
NOTIFICATION_SERVICE_PORT = 5004
API_GATEWAY_PORT = 8080
USER_SERVICE_HOST = "127.0.0.1"
GRIEVANCE_SERVICE_HOST = "127.0.0.1"
ADMIN_SERVICE_HOST = "127.0.0.1"
ML_SERVICE_HOST = "127.0.0.1"
NOTIFICATION_SERVICE_HOST = "127.0.0.1"
USER_SERVICE_URL = None
GRIEVANCE_SERVICE_URL = None
ADMIN_SERVICE_URL = None
ML_SERVICE_URL = None
NOTIFICATION_SERVICE_URL = None
FLASK_DEBUG = True
GEMINI_API_KEY = None
RABBITMQ_HOST = "localhost"
RABBITMQ_PORT = 5672
RABBITMQ_USER = "guest"
RABBITMQ_PASSWORD = "guest"
RABBITMQ_VHOST = "/"
RABBITMQ_URL = None
NOTIFICATION_QUEUE = "notifications"


def init_settings(service_name=None):
    global CONNECTION_STRING, JWT_SECRET, JWT_EXPIRY_HOURS
    global USER_SERVICE_PORT, GRIEVANCE_SERVICE_PORT, ADMIN_SERVICE_PORT, ML_SERVICE_PORT
    global NOTIFICATION_SERVICE_PORT, API_GATEWAY_PORT
    global USER_SERVICE_HOST, GRIEVANCE_SERVICE_HOST, ADMIN_SERVICE_HOST, ML_SERVICE_HOST
    global NOTIFICATION_SERVICE_HOST
    global USER_SERVICE_URL, GRIEVANCE_SERVICE_URL, ADMIN_SERVICE_URL, ML_SERVICE_URL
    global NOTIFICATION_SERVICE_URL
    global FLASK_DEBUG, GEMINI_API_KEY
    global RABBITMQ_HOST, RABBITMQ_PORT, RABBITMQ_USER, RABBITMQ_PASSWORD
    global RABBITMQ_VHOST, RABBITMQ_URL, NOTIFICATION_QUEUE

    load_service_env()

    conn_env = SERVICE_CONNECTION_ENV.get(service_name)
    if conn_env:
        CONNECTION_STRING = os.getenv(conn_env) or os.getenv("CONNECTION_STRING")
    else:
        CONNECTION_STRING = os.getenv("CONNECTION_STRING")
    JWT_SECRET = os.getenv("JWT_SECRET", "change-me-in-production")
    JWT_EXPIRY_HOURS = int(os.getenv("JWT_EXPIRY_HOURS", "24"))
    USER_SERVICE_PORT = int(os.getenv("USER_SERVICE_PORT", "5000"))
    GRIEVANCE_SERVICE_PORT = int(os.getenv("GRIEVANCE_SERVICE_PORT", "5001"))
    ADMIN_SERVICE_PORT = int(os.getenv("ADMIN_SERVICE_PORT", "5002"))
    ML_SERVICE_PORT = int(os.getenv("ML_SERVICE_PORT", "5003"))
    NOTIFICATION_SERVICE_PORT = int(os.getenv("NOTIFICATION_SERVICE_PORT", "5004"))
    API_GATEWAY_PORT = int(os.getenv("API_GATEWAY_PORT", "8080"))
    USER_SERVICE_HOST = os.getenv("USER_SERVICE_HOST", "127.0.0.1")
    GRIEVANCE_SERVICE_HOST = os.getenv("GRIEVANCE_SERVICE_HOST", "127.0.0.1")
    ADMIN_SERVICE_HOST = os.getenv("ADMIN_SERVICE_HOST", "127.0.0.1")
    ML_SERVICE_HOST = os.getenv("ML_SERVICE_HOST", "127.0.0.1")
    NOTIFICATION_SERVICE_HOST = os.getenv("NOTIFICATION_SERVICE_HOST", "127.0.0.1")
    USER_SERVICE_URL = f"http://{USER_SERVICE_HOST}:{USER_SERVICE_PORT}"
    GRIEVANCE_SERVICE_URL = f"http://{GRIEVANCE_SERVICE_HOST}:{GRIEVANCE_SERVICE_PORT}"
    ADMIN_SERVICE_URL = f"http://{ADMIN_SERVICE_HOST}:{ADMIN_SERVICE_PORT}"
    ML_SERVICE_URL = f"http://{ML_SERVICE_HOST}:{ML_SERVICE_PORT}"
    NOTIFICATION_SERVICE_URL = f"http://{NOTIFICATION_SERVICE_HOST}:{NOTIFICATION_SERVICE_PORT}"
    FLASK_DEBUG = os.getenv("FLASK_DEBUG", "True").lower() == "true"
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
    RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", "5672"))
    RABBITMQ_USER = os.getenv("RABBITMQ_USER", "guest")
    RABBITMQ_PASSWORD = os.getenv("RABBITMQ_PASSWORD", "guest")
    RABBITMQ_VHOST = os.getenv("RABBITMQ_VHOST", "/")
    RABBITMQ_URL = os.getenv("RABBITMQ_URL")
    NOTIFICATION_QUEUE = os.getenv("NOTIFICATION_QUEUE", "notifications")

    if service_name not in ("api_gateway", "ml_models") and not CONNECTION_STRING:
        raise RuntimeError(
            "CONNECTION_STRING is not set. Copy backend/.env.example to backend/.env "
            "and configure your database connection."
        )
    if JWT_SECRET == "change-me-in-production":
        import warnings
        warnings.warn(
            "JWT_SECRET is using the default value. Set a strong secret in backend/.env.",
            stacklevel=2,
        )
