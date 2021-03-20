from flask import Blueprint, request
import db
import models

app = Blueprint('route_table', __name__)


@app.route('', strict_slashes=False)
def route_table_list():
    return db.get_items(models.RouteTable, **request.args)


@app.route('/<resource_id>')
def route_table(resource_id):
    item = db.get_item(models.RouteTable, resource_id=resource_id)
    return item
