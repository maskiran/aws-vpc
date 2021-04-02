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
        # 'regions': len(models.Vpc.objects.search_text(vpc_id).distinct('region')),
        # 'vpcs': models.Vpc.objects.count(),
        # 'subnets': models.Subnet.objects.search_text(vpc_id).count(),
        # 'security_groups': models.SecurityGroup.objects.search_text(vpc_id).count(),
        # 'route_tables': models.RouteTable.objects.search_text(vpc_id).count(),
        # 'instances': models.Instance.objects.search_text(vpc_id).count(),
        # 'load_balancers': models.LoadBalancer.objects.search_text(vpc_id).count(),
        'regions': len(models.Vpc.objects().distinct('region')),
        'accounts': models.Account.objects.count(),
        'vpcs': models.Vpc.objects.count(),
        'subnets': models.Subnet.objects(**query).count(),
        'security_groups': models.SecurityGroup.objects(**query).count(),
        'route_tables': models.RouteTable.objects(**query).count(),
        'instances': models.Instance.objects(**query).count(),
        'load_balancers': models.LoadBalancer.objects(**query).count(),
    }
