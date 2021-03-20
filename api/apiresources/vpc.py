from flask import Blueprint, request
import db
import models

app = Blueprint('vpc', __name__)


@app.route('', strict_slashes=False)
def vpc_list():
    return db.get_items(models.Vpc, **request.args)
