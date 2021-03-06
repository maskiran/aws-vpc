import copy
import datetime
import logging
from aws_utils import get_boto3_resource, add_tags_as_keys, get_name_tag, normalize_tags_list
import db
import models


def sync(account_number, region, vpc_id='', lb_name=''):
    cur_date = datetime.datetime.utcnow()
    client, account_id = get_boto3_resource('elbv2', region,
                                            account_number=account_number)
    logging.info('Syncing Elastic Load balancers %s %s %s',
                 account_id, region, vpc_id)
    if not vpc_id:
        target_groups = get_all_target_groups(client)
    lb_names = []
    if lb_name:
        lb_names.append(lb_name)
    added = 0
    pagination = {'PageSize': 20}
    if lb_name:
        pagination = None
    for page in client.get_paginator('describe_load_balancers').paginate(Names=lb_names,
                                                                         PaginationConfig=pagination):
        logging.info('Got page with item count %s', len(page['LoadBalancers']))
        page_items = []
        for item in page['LoadBalancers']:
            if item['Type'] != 'network':
                continue
            if vpc_id and item['VpcId'] != vpc_id:
                continue
            if vpc_id:
                target_groups = {
                    item['LoadBalancerArn']: client.describe_target_groups(
                        LoadBalancerArn=item['LoadBalancerArn'])['TargetGroups']
                }
            info = {
                'date_added': cur_date,
                'region': region,
                'account_id': account_id,
                'resource_id': item['LoadBalancerName'],
                'vpc_id': item['VpcId'],
                'vpc_name': db.get_item(models.Vpc, vpc_id=item['VpcId']).get('name', ''),
                'name': item['LoadBalancerName'],
                'type': item['Type'],
                'scheme': item.get('Scheme', ''),
                'dns': item.get('DNSName', ''),
                'arn': item['LoadBalancerArn'],
                'created_time': item['CreatedTime'],
                'subnets': [{
                    'resource_id': az['SubnetId'],
                    'name': db.get_item(models.Subnet, resource_id=az['SubnetId']).get('name', '')
                } for az in item['AvailabilityZones']],
                'listeners': get_listeners(client, item['LoadBalancerArn'],
                                           target_groups.get(item['LoadBalancerArn'], [])),
            }
            page_items.append(info)
            added += 1
        get_lb_tags(client, page_items)
        db.replace_items(models.LoadBalancer, page_items)
    logging.info('Addition done')
    del_query = {
        'region': region,
        'account_id': account_id,
        'date_added__ne': cur_date,
        'type': 'network'
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


def get_all_target_groups(client, vpc_id=''):
    """
    Get all target groups and store them in a dict with key as the loadbalancer arn
    """
    tgt_groups = {}
    for page in client.get_paginator('describe_target_groups').paginate():
        page_items = []
        for item in page['TargetGroups']:
            if vpc_id and item['VpcId'] != vpc_id:
                continue
            for lb_arn in item['LoadBalancerArns']:
                if lb_arn not in tgt_groups:
                    tgt_groups[lb_arn] = []
                tgt_groups[lb_arn].append(item)
    return tgt_groups


def get_lb_tags(client, lb_items_list):
    tags = {}
    lb_arns = [lb['arn'] for lb in lb_items_list]
    if len(lb_arns) == 0:
        return
    # rearrange tags by lb arn
    for tag_item in client.describe_tags(ResourceArns=lb_arns)['TagDescriptions']:
        tags[tag_item['ResourceArn']] = tag_item['Tags']
    for lb_item in lb_items_list:
        lb_item['tags'] = normalize_tags_list(tags[lb_item['arn']])
        add_tags_as_keys(lb_item, tags[lb_item['arn']])


def get_listeners(client, lb_arn, target_groups_list):
    data = []
    for listener in client.describe_listeners(LoadBalancerArn=lb_arn)['Listeners']:
        tgt_arn = listener['DefaultActions'][0]['TargetGroupArn']
        data.append({
            'port': listener['Port'],
            'protocol': listener['Protocol'],
            'target_group_arn': tgt_arn,
            'instances': get_targets(client, tgt_arn, target_groups_list)
        })
    return data


def get_targets(client, target_arn, target_groups_list=None):
    data = []
    tgt_group = [
        i for i in target_groups_list if i['TargetGroupArn'] == target_arn][0]
    for tgt in client.describe_target_health(TargetGroupArn=target_arn)['TargetHealthDescriptions']:
        item = {
            'resource_id': tgt['Target']['Id'],
            'name': db.get_item(models.Instance, resource_id=tgt['Target']['Id']).get('name', ''),
            'target_port': tgt['Target']['Port'],
            'target_protocol': tgt_group['Protocol'],
        }
        data.append(item)
    return data
