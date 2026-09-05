import os
import sys

sys.path.append(os.getcwd())

from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from grievance_app.routes.grievance_routes import grievance_bp
from shared.utils.db_utils import db, migrate
load_dotenv()

ML_SERVICE_URL = os.getenv("ML_SERVICE_URL")
FLASK_DEBUG = os.getenv("FLASK_DEBUG")
GRIEVANCE_SERVICE_PORT = os.getenv("GRIEVANCE_SERVICE_PORT")
CONNECTION_STRING = os.getenv("GRIEVANCE_CONNECTION_STRING")

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = CONNECTION_STRING
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ECHO"] = True

db.init_app(app)
migrate.init_app(app, db)
app.register_blueprint(grievance_bp)

if __name__ == "__main__":
    app.run(debug=FLASK_DEBUG, port=GRIEVANCE_SERVICE_PORT)
