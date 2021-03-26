from flask import Blueprint, request
import db
import models

app = Blueprint('vpc', __name__)


@app.route('', strict_slashes=False)
def vpc_list():
    return db.get_items(models.Vpc, **request.args)


@app.route('/<resource_id>')
def vpc(resource_id):
    item = db.get_item(models.Vpc, resource_id=resource_id)
    return item
