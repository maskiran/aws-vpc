from flask import Blueprint, request
import db
import models

app = Blueprint('dashboard', __name__)


@app.route('', strict_slashes=False)
def dashboard():
    rsp = {}
    rsp['accounts'] = models.Account.objects.count()
    if 'search' in request.args:
        search = request.args['search']
        rsp['regions'] = len(
            models.Vpc.objects.search_text(search).distinct('region'))
        rsp['vpcs'] = models.Vpc.objects.search_text(search).count()
        rsp['subnets'] = models.Subnet.objects.search_text(search).count()
        rsp['security_groups'] = models.SecurityGroup.objects.search_text(
            search).count()
        rsp['route_tables'] = models.RouteTable.objects.search_text(
            search).count()
        rsp['instances'] = models.Instance.objects.search_text(search).count()
        rsp['load_balancers'] = models.LoadBalancer.objects.search_text(
            search).count()
        rsp['tgw_attachments'] = models.TgwAttachment.objects.search_text(search).count()
    else:
        query = request.args
        rsp['regions'] = len(models.Vpc.objects().distinct('region'))
        rsp['vpcs'] = models.Vpc.objects(**query).count()
        rsp['subnets'] = models.Subnet.objects(**query).count()
        rsp['security_groups'] = models.SecurityGroup.objects(**query).count()
        rsp['route_tables'] = models.RouteTable.objects(**query).count()
        rsp['instances'] = models.Instance.objects(**query).count()
        rsp['load_balancers'] = models.LoadBalancer.objects(**query).count()
        rsp['tgw_attachments'] = models.TgwAttachment.objects(**query).count()
    return rsp
