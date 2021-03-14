from flask import Blueprint, request
from aws_utils import get_boto3_resource, add_tags_as_keys, get_name_tag, format_routes_attribute

app = Blueprint('subnet', __name__)

@app.route('', strict_slashes=False)
def subnet_list():
    ec2 = get_boto3_resource('ec2')
    data = []
    vpc_id = request.args.get('vpc_id')
    if not vpc_id:
        return {'error': 'vpc_id=<vpc-id> query parameter required'}, 400
    for item in ec2.subnets.filter(Filters=[{'Name': 'vpc-id', 'Values': [vpc_id]}]).all():
        info = {
            'id': item.id,
            'cidr': item.cidr_block,
            'name': get_name_tag(item.tags, item.id),
            'az': item.availability_zone,
        }
        add_tags_as_keys(info, item.tags)
        data.append(info)
    data = sorted(data, key=lambda x: x['name'].lower())
    return {'items': data}


@app.route('/<string:subnet_id>')
def subnet_details(subnet_id):
    ec2 = get_boto3_resource('ec2')
    item = ec2.Subnet(subnet_id)
    data = {
        'id': item.id,
        'cidr': item.cidr_block,
        'name': get_name_tag(item.tags, item.id),
        'az': item.availability_zone,
        'tags': item.tags,
    }
    rtable_list = list(ec2.route_tables.filter(Filters=[
        {'Name': 'association.subnet-id', 'Values': [subnet_id]}
    ]).all())
    if len(rtable_list):
        rtable = rtable_list[0]
        data['route-table-id'] = rtable.id
        data['route-table-name'] = get_name_tag(rtable.tags, rtable.id)
        format_routes_attribute(rtable.routes_attribute, ec2)
        data['routes'] = rtable.routes_attribute
    return data


