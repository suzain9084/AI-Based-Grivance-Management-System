import os
import sys

sys.path.append(os.getcwd())

from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from shared.utils.db_utils import db, migrate
from user_app.routes.user_routes import user_bp
from user_app.models.user_model import User

load_dotenv()
CONNECTION_STRING = os.getenv("USER_CONNECTION_STRING")
FLASK_DEBUG = os.getenv("FLASK_DEBUG")
USER_SERVICE_PORT = os.getenv("USER_SERVICE_PORT")

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = CONNECTION_STRING
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ECHO"] = True

db.init_app(app)
migrate.init_app(app, db)
app.register_blueprint(user_bp)

if __name__ == "__main__":
    app.run(debug=FLASK_DEBUG, port=USER_SERVICE_PORT)
