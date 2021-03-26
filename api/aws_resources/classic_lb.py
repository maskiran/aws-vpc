import datetime
from aws_utils import get_boto3_resource, add_tags_as_keys, get_name_tag, normalize_tags_list
import db
import models


def sync_clbs(region='us-east-1'):
    cur_date = datetime.datetime.utcnow()
    client = get_boto3_resource('elb', region)
    for page in client.get_paginator('describe_load_balancers').paginate(PaginationConfig={'PageSize': 20}):
        page_items = []
        for item in page['LoadBalancerDescriptions']:
            print(item['LoadBalancerName'])
            info = {
                'date_added': cur_date,
                'region': region,
                # 'account_id': item['OwnerId'],
                'resource_id': item['LoadBalancerName'],
                'vpc_id': item['VPCId'],
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
        get_lb_tags(client, page_items)
        db.replace_items(models.LoadBalancer, page_items)
    db.delete_items(models.Vpc, date_added__ne=cur_date)


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


if __name__ == "__main__":
    sync_clbs()
