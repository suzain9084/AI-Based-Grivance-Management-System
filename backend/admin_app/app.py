import os
import sys

sys.path.append(os.getcwd())

from flask import Flask
from flask_cors import CORS

from admin_app.routes.admin_routes import admin_bp
from config.settings import ADMIN_SERVICE_PORT, CONNECTION_STRING, FLASK_DEBUG, init_settings
from shared.utils.db_utils import db

init_settings("admin_app")

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = CONNECTION_STRING
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ECHO"] = True

db.init_app(app)
app.register_blueprint(admin_bp)

if __name__ == "__main__":
    app.run(debug=FLASK_DEBUG, port=ADMIN_SERVICE_PORT)
