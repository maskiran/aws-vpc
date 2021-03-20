from flask import Blueprint, request
import db
import models

app = Blueprint('instance', __name__)


@app.route('', strict_slashes=False)
def instance_list():
    return db.get_items(models.Instance, **request.args)


@app.route('/<resource_id>')
def instance(resource_id):
    item = db.get_item(models.Instance, resource_id=resource_id)
    return item
