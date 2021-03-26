from flask import Blueprint, request
import db
import models

app = Blueprint('load_balancer', __name__)


@app.route('', strict_slashes=False)
def lb_list():
    return db.get_items(models.LoadBalancer, **request.args)


@app.route('/<resource_id>')
def lb(resource_id):
    item = db.get_item(models.LoadBalancer, resource_id=resource_id)
    return item
