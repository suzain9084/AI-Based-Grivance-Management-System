import os
import sys

sys.path.append(os.getcwd())

from flask import Flask
from flask_cors import CORS

from config.settings import CONNECTION_STRING, FLASK_DEBUG, GRIEVANCE_SERVICE_PORT, init_settings
from grievance_app.routes.grievance_routes import grievance_bp
from shared.utils.db_utils import db, migrate

init_settings("grievance_app")

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
