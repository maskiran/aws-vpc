from flask import Blueprint
from aws_utils import get_boto3_resource, add_tags_as_keys, get_name_tag

app = Blueprint('vpc', __name__)

@app.route('', strict_slashes=False)
def vpc_list():
    ec2 = get_boto3_resource('ec2')
    data = []
    for item in ec2.vpcs.all():
        info = {
            'id': item.id,
            'cidr': [x['CidrBlock'] for x in item.cidr_block_association_set],
            'name': get_name_tag(item.tags, item.id),
        }
        add_tags_as_keys(info, item.tags)
        data.append(info)
    data = sorted(data, key=lambda x: x['name'].lower())
    return {'items': data}