import os
from pathlib import Path

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parent.parent


def load_service_env(service_name=None):
    """Load shared env first, then optional service-specific overrides."""
    load_dotenv(BACKEND_DIR / ".env")
    load_dotenv(BACKEND_DIR / "shared" / ".env", override=True)
    if service_name:
        load_dotenv(BACKEND_DIR / service_name / ".env", override=True)
    load_dotenv(BACKEND_DIR / "ML_Models" / ".env", override=True)


CONNECTION_STRING = None
JWT_SECRET = None
JWT_EXPIRY_HOURS = 24
USER_SERVICE_PORT = 5000
GRIEVANCE_SERVICE_PORT = 5001
ADMIN_SERVICE_PORT = 5002
FLASK_DEBUG = True
GEMINI_API_KEY = None


def init_settings(service_name=None):
    global CONNECTION_STRING, JWT_SECRET, JWT_EXPIRY_HOURS
    global USER_SERVICE_PORT, GRIEVANCE_SERVICE_PORT, ADMIN_SERVICE_PORT
    global FLASK_DEBUG, GEMINI_API_KEY

    load_service_env(service_name)

    CONNECTION_STRING = os.getenv("CONNECTION_STRING")
    JWT_SECRET = os.getenv("JWT_SECRET", "change-me-in-production")
    JWT_EXPIRY_HOURS = int(os.getenv("JWT_EXPIRY_HOURS", "24"))
    USER_SERVICE_PORT = int(os.getenv("USER_SERVICE_PORT", "5000"))
    GRIEVANCE_SERVICE_PORT = int(os.getenv("GRIEVANCE_SERVICE_PORT", "5001"))
    ADMIN_SERVICE_PORT = int(os.getenv("ADMIN_SERVICE_PORT", "5002"))
    FLASK_DEBUG = os.getenv("FLASK_DEBUG", "True").lower() == "true"
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

    if not CONNECTION_STRING:
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
