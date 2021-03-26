from flask import Blueprint, request
import db
import models

app = Blueprint('vpcdashboard', __name__)

@app.route('', strict_slashes=False)
@app.route('/<vpc_id>')
def vpc_dashboard(vpc_id=None):
    if vpc_id:
        query = {'vpc_id': vpc_id}
    else:
        query = {}
    return {
        'vpcs': models.Vpc.objects.count(),
        'subnets': models.Subnet.objects(**query).count(),
        'security_groups': models.SecurityGroup.objects(**query).count(),
        'route_tables': models.RouteTable.objects(**query).count(),
        'instances': models.Instance.objects(**query).count(),
    }
