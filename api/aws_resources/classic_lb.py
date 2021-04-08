import copy
import datetime
import logging
from aws_utils import get_boto3_resource, add_tags_as_keys, get_name_tag, normalize_tags_list
import db
import models


def sync(region, account_number, vpc_id='', lb_name=''):
    cur_date = datetime.datetime.utcnow()
    client, account_id = get_boto3_resource('elb', region,
                                            account_number=account_number)
    logging.info('Syncing Classic Load Balancers %s %s %s',
                 account_id, region, vpc_id)
    lb_names = []
    if lb_name:
        lb_names.append(lb_name)
    added = 0
    for page in client.get_paginator('describe_load_balancers').paginate(LoadBalancerNames=lb_names,
                                                                         PaginationConfig={'PageSize': 20}):
        logging.info('Got page with item count %s',
                     len(page['LoadBalancerDescriptions']))
        page_items = []
        for item in page['LoadBalancerDescriptions']:
            if vpc_id and item['VPCId'] != vpc_id:
                continue
            info = {
                'date_added': cur_date,
                'region': region,
                'account_id': account_id,
                'resource_id': item['LoadBalancerName'],
                'vpc_id': item['VPCId'],
                'vpc_name': db.get_item(models.Vpc, vpc_id=item['VPCId'])['name'],
                'name': item['LoadBalancerName'],
                'type': 'classic',
                'scheme': item['Scheme'],
                'created_time': item['CreatedTime'],
                'subnets': [{
                    'resource_id': subnet,
                    'name': db.get_item(models.Subnet, resource_id=subnet)['name']
                } for subnet in item['Subnets']],
                'security_groups': [
                    {
                        'resource_id': sg,
                        'name': db.get_item(models.SecurityGroup, resource_id=sg)['name']
                    } for sg in item['SecurityGroups']],
                'dns': item['DNSName'],
                'listeners': get_listeners(item)
            }
            page_items.append(info)
            added += 1
        get_lb_tags(client, page_items)
        db.replace_items(models.LoadBalancer, page_items)
    logging.info('Addition done')
    del_query = {
        'region': region,
        'account_id': str(account_id),
        'date_added__ne': cur_date,
        'type': 'classic'
    }
    if vpc_id:
        del_query['vpc_id'] = vpc_id
    if lb_name:
        del_query['resource_id'] = lb_name
    deleted = db.delete_items(models.LoadBalancer, **del_query)
    logging.info('Delete done')
    rsp = {'added': added, 'deleted': deleted}
    logging.info(rsp)
    return rsp


def get_lb_tags(client, lb_items_list):
    tags = {}
    lb_arns = [lb['name'] for lb in lb_items_list]
    if len(lb_arns) == 0:
        return
    # rearrange tags by lb arn
    for tag_item in client.describe_tags(LoadBalancerNames=lb_arns)['TagDescriptions']:
        tags[tag_item['LoadBalancerName']] = tag_item['Tags']
    for lb_item in lb_items_list:
        lb_item['tags'] = normalize_tags_list(tags[lb_item['name']])
        add_tags_as_keys(lb_item, tags[lb_item['name']])


def get_listeners(lb_item):
    data = []
    for listener in lb_item['ListenerDescriptions']:
        data.append({
            'port': listener['Listener']['LoadBalancerPort'],
            'protocol': listener['Listener']['Protocol'],
            'instances': get_instances(lb_item, listener['Listener'])
        })
    return data


def get_instances(lb_item, listener):
    data = []
    for inst in lb_item['Instances']:
        inst_info = db.get_item(
            models.Instance, resource_id=inst['InstanceId'])
        if not inst_info:
            inst_info = {}
        data.append({
            'resource_id': inst['InstanceId'],
            'name': inst_info.get('name', ''),
            'az': inst_info.get('az', ''),
            'target_port': listener['InstancePort'],
            'target_protocol': listener['InstanceProtocol'],
        })
    return data
