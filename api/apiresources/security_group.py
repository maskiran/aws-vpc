from flask import Blueprint, request
import db
import models

app = Blueprint('security_group', __name__)


@app.route('', strict_slashes=False)
def security_group_list():
    return db.get_items(models.SecurityGroup, **request.args)


@app.route('/<resource_id>')
def security_group(resource_id):
    item = db.get_item(models.SecurityGroup, resource_id=resource_id)
    return item
