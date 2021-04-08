from flask import Blueprint, request
import db
import models
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
        args = {'region': region, 'account_number': account,
                'vpc_id': resource_id, 'state': 'queued'}
        vpc_name = db.get_item(models.Vpc, resource_id=resource_id).get('name')
        args['vpc_name'] = vpc_name
        models.VpcSyncTask(**args).save()
        return 'sync task scheduled'
    if resource == 'security-group':
        return aws_resources.security_group.sync(account, region,
                                                 security_group_id=resource_id)
    if resource == 'subnet':
        return aws_resources.subnet.sync(account, region,
                                         subnet_id=resource_id)
    if resource == 'route-table':
        return aws_resources.route_table.sync(account, region,
                                              route_table_id=resource_id)
    if resource == 'instance':
        return aws_resources.instance.sync(account, region,
                                           instance_id=resource_id)
    if resource == 'elastic-lb':
        return aws_resources.elastic_lb.sync(account, region,
                                             lb_name=resource_id)
    if resource == 'classic-lb':
        return aws_resources.classic_lb.sync(account, region,
                                             lb_name=resource_id)
    if resource == 'tgw-attachment':
        return aws_resources.tgw_attachment.sync(account, region,
                                                 attachment_id=resource_id)
