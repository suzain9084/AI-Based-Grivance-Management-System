import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask
from flask_cors import CORS

from config.settings import FLASK_DEBUG, ML_SERVICE_PORT, init_settings
from ML_Models.routes.ml_model_routes import ml_model_routes_bp

init_settings("ml_models")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.register_blueprint(ml_model_routes_bp)


@app.route("/health", methods=["GET"])
def health():
    return {"status": "ok", "service": "ml-models"}, 200


if __name__ == "__main__":
    app.run(debug=FLASK_DEBUG, port=ML_SERVICE_PORT)
