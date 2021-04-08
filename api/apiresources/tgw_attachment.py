from flask import Blueprint, request
import aws_utils
import aws_resources.tgw_attachment
import db
import models

app = Blueprint('tgw_attachment', __name__)


@app.route('', strict_slashes=False)
def tgw_attachment_list():
    return db.get_items(models.TgwAttachment, **request.args)


@app.route('/<resource_id>')
def tgw_attachment(resource_id):
    item = db.get_item(models.TgwAttachment, resource_id=resource_id)
    # get the routes for the route table if any
    rtable = item.get('route_table_id', None)
    if not rtable:
        return item
    routes = aws_resources.tgw_attachment.get_tgw_routes(
        item['region'], item['account_id'], rtable)
    item['tgw_routes'] = routes
    vpc_side_routes = {}
    for subnet in item['subnets']:
        routes = db.get_item(models.RouteTable,
                             region=item['region'],
                             resource_id=subnet['route_table_id'])
        vpc_side_routes[subnet['name']] = routes['routes']
    item['vpc_routes'] = vpc_side_routes
    return item
