from flask import Blueprint, request
from aws_utils import get_boto3_resource, add_tags_as_keys, get_name_tag, format_routes_attribute

app = Blueprint('route_table', __name__)


@app.route('', strict_slashes=False)
def route_table_list():
    ec2 = get_boto3_resource('ec2')
    data = []
    vpc_id = request.args.get('vpc_id')
    if not vpc_id:
        return {'error': 'vpc_id=<vpc-id> query parameter required'}, 400
    for item in ec2.route_tables.filter(Filters=[{'Name': 'vpc-id', 'Values': [vpc_id]}]).all():
        info = {
            'id': item.id,
            'name': get_name_tag(item.tags, item.id),
        }
        add_tags_as_keys(info, item.tags)
        data.append(info)
    data = sorted(data, key=lambda x: x['name'].lower())
    return {'items': data}


@app.route('/<string:route_table_id>')
def route_table(route_table_id):
    ec2 = get_boto3_resource('ec2')
    rt = ec2.RouteTable(route_table_id)
    data = {
        'id': rt.id,
        'name': get_name_tag(rt.tags, rt.id),
        'tags': rt.tags,
    }
    format_routes_attribute(rt.routes_attribute, ec2)
    data['routes'] = rt.routes_attribute
    return data
