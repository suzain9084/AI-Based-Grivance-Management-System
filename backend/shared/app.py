from flask import Flask
from shared.utils.db_utils import db
from shared.utils.db_utils import migrate
import dotenv
import os
dotenv.load_dotenv()

CONNECTION_STRING = os.getenv('CONNECTION_STRING')

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = CONNECTION_STRING
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


db.init_app(app)
migrate.init_app(app, db)

from shared.models import user_model
from shared.models import grievance_model
from shared.models import commitee_model
from shared.models import admin_model