from flask import Blueprint, request
import db
import models

app = Blueprint('subnet', __name__)


@app.route('', strict_slashes=False)
def subnet_list():
    return db.get_items(models.Subnet, **request.args)


@app.route('/<resource_id>')
def subnet(resource_id):
    item = db.get_item(models.Subnet, resource_id=resource_id)
    routes = db.get_item(
        models.RouteTable, resource_id=item['route_table']['resource_id'])
    item['routes'] = routes['routes']
    return item
