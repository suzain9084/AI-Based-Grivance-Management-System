import os
import sys

sys.path.append(os.getcwd())

from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from shared.utils.db_utils import db, migrate
from admin_app.routes.admin_routes import admin_bp
from admin_app.models.admin_model import Admin

load_dotenv()
ADMIN_SERVICE_PORT = os.getenv("ADMIN_SERVICE_PORT")
CONNECTION_STRING = os.getenv("ADMIN_CONNECTION_STRING")
FLASK_DEBUG = os.getenv("FLASK_DEBUG")

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = CONNECTION_STRING
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ECHO"] = True

db.init_app(app)
migrate.init_app(app, db)
app.register_blueprint(admin_bp)

if __name__ == "__main__":
    app.run(debug=FLASK_DEBUG, port=ADMIN_SERVICE_PORT)
