from flask import Blueprint, request
import arrow
from aws_utils import get_boto3_resource, add_tags_as_keys, get_name_tag

app = Blueprint('instance', __name__)


@app.route('', strict_slashes=False)
def instance_list():
    ec2 = get_boto3_resource('ec2')
    data = []
    vpc_id = request.args.get('vpc_id')
    if not vpc_id:
        return {'error': 'vpc_id=<vpc-id> query parameter required'}, 400
    for item in ec2.instances.filter(Filters=[{'Name': 'vpc-id', 'Values': [vpc_id]}]).all():
        info = {
            'id': item.id,
            'name': get_name_tag(item.tags, item.id),
            'launch_time': arrow.get(item.launch_time).for_json(),
            'instance_type': item.instance_type,
            'private_ip_address': item.private_ip_address,
            'public_ip_address': item.public_ip_address,
            'key_name': item.key_name,
            'role': item.iam_instance_profile.get('Arn') if item.iam_instance_profile else '',
        }
        add_tags_as_keys(info, item.tags)
        data.append(info)
    data = sorted(data, key=lambda x: x['name'].lower())
    return {'items': data}
