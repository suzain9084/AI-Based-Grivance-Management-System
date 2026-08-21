import os
import sys

sys.path.append(os.getcwd())

from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO

from config.settings import CONNECTION_STRING, FLASK_DEBUG, NOTIFICATION_SERVICE_PORT, init_settings
from notification_app.rabbitMQ.consumer import start_consumer
from notification_app.router.notification_routes import notification_routes_bp
from notification_app.services import notification_service
from notification_app.websockets.connection_manager import ConnectionManager
from shared.utils.db_utils import db, migrate

init_settings("notification_app")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.config["SQLALCHEMY_DATABASE_URI"] = CONNECTION_STRING
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
migrate.init_app(app, db)
socketio = SocketIO(app, cors_allowed_origins="*")
notification_service.init_socketio(socketio)

app.register_blueprint(notification_routes_bp)


@app.route("/health", methods=["GET"])
def health():
    return {"status": "ok", "service": "notification"}, 200


@socketio.on("connect")
def handle_connect():
    return ConnectionManager.on_connect()


@socketio.on("disconnect")
def handle_disconnect():
    ConnectionManager.on_disconnect()


if __name__ == "__main__":
    start_consumer(app)
    socketio.run(app, debug=FLASK_DEBUG, port=NOTIFICATION_SERVICE_PORT)
