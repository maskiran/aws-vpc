from flask import Blueprint, request
from aws_utils import get_boto3_resource, add_tags_as_keys, get_name_tag

app = Blueprint('security_group', __name__)


@app.route('', strict_slashes=False)
def security_group_list():
    ec2 = get_boto3_resource('ec2')
    data = []
    vpc_id = request.args.get('vpc_id')
    if not vpc_id:
        return {'error': 'vpc_id=<vpc-id> query parameter required'}, 400
    for item in ec2.security_groups.filter(Filters=[{'Name': 'vpc-id', 'Values': [vpc_id]}]).all():
        info = {
            'id': item.id,
            'name': item.group_name,
        }
        add_tags_as_keys(info, item.tags)
        data.append(info)
    data = sorted(data, key=lambda x: x['name'].lower())
    return {'items': data}


@app.route('/<string:security_group_id>')
def security_group(security_group_id):
    ec2 = get_boto3_resource('ec2')
    sg = ec2.SecurityGroup(security_group_id)
    data = {
        'id': sg.id,
        'name': sg.group_name,
        'inbound_rules': sg.ip_permissions,
        'outbound_rules': sg.ip_permissions_egress,
    }
    return data
