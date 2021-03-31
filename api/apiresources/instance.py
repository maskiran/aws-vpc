from flask import Blueprint, request
import db
import models

app = Blueprint('instance', __name__)


@app.route('', strict_slashes=False)
def instance_list():
    return db.get_items(models.Instance, **request.args)


@app.route('/<resource_id>')
def instance(resource_id):
    item = db.get_item(models.Instance, resource_id=resource_id)
    # for all the interfaces get the security group rules
    for intf in item['network_interfaces']:
        for sg in intf['security_groups']:
            sg_details = db.get_item(models.SecurityGroup, resource_id=sg['resource_id'])
            sg['ingress_rules'] = sg_details['ingress_rules']
            sg['egress_rules'] = sg_details['egress_rules']
    return item
