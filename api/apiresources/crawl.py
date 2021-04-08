from flask import Blueprint, request
import db
import models
from sync_aws import sync_resources
import aws_resources.subnet
import aws_resources.security_group
import aws_resources.route_table
import aws_resources.instance
import aws_resources.elastic_lb
import aws_resources.classic_lb
import aws_resources.tgw_attachment

app = Blueprint('crawl', __name__)


@app.route('/<account>/<region>/<resource>/<resource_id>')
def crawl(account, region, resource, resource_id):
    if resource == 'vpc':
        return sync_resources(region, account, vpc_id, new_connection=False)
    if resource == 'security-group':
        return aws_resources.security_group.sync(region, account,
                                                 security_group_id=resource_id)
    if resource == 'subnet':
        return aws_resources.subnet.sync(region, account,
                                         subnet_id=resource_id)
    if resource == 'route-table':
        return aws_resources.route_table.sync(region, account,
                                              route_table_id=resource_id)
    if resource == 'instance':
        return aws_resources.instance.sync(region, account,
                                           instance_id=resource_id)
    if resource == 'elastic-lb':
        return aws_resources.elastic_lb.sync(region, account,
                                             lb_name=resource_id)
    if resource == 'classic-lb':
        return aws_resources.classic_lb.sync(region, account,
                                             lb_name=resource_id)
    if resource == 'tgw-attachment':
        return aws_resources.tgw_attachment.sync(region, account,
                                                 attachment_id=resource_id)
