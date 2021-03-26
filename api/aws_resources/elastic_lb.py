import datetime
from aws_utils import get_boto3_resource, add_tags_as_keys, get_name_tag, normalize_tags_list
import db
import models


def sync_elbs(region='us-east-1'):
    cur_date = datetime.datetime.utcnow()
    client = get_boto3_resource('elbv2', region)
    target_groups = get_all_target_groups(client)
    for page in client.get_paginator('describe_load_balancers').paginate(PaginationConfig={'PageSize': 20}):
        page_items = []
        for item in page['LoadBalancers']:
            if item['Type'] == 'application' or item['Type'] == 'gateway':
                continue
            print(item['LoadBalancerName'])
            info = {
                'date_added': cur_date,
                'region': region,
                'resource_id': item['LoadBalancerName'],
                'vpc_id': item['VpcId'],
                'name': item['LoadBalancerName'],
                'type': item['Type'],
                'scheme': item.get('Scheme', ''),
                'dns': item.get('DNSName', ''),
                'arn': item['LoadBalancerArn'],
                'subnets': [{
                    'resource_id': az['SubnetId'],
                    'name': db.get_item(models.Subnet, resource_id=az['SubnetId'])['name']
                } for az in item['AvailabilityZones']],
                'listeners': get_listeners(client, item['LoadBalancerArn'],
                                           target_groups.get(item['LoadBalancerArn'], [])),
            }
            page_items.append(info)
        get_lb_tags(client, page_items)
        db.replace_items(models.LoadBalancer, page_items)
    db.delete_items(models.Vpc, date_added__ne=cur_date)


def get_all_target_groups(client):
    """
    Get all target groups and store them in a dict with key as the loadbalancer arn
    """
    tgt_groups = {}
    for page in client.get_paginator('describe_target_groups').paginate():
        page_items = []
        for item in page['TargetGroups']:
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


def get_targets(client, target_arn, target_groups_list):
    data = []
    tgt_group = [
        i for i in target_groups_list if i['TargetGroupArn'] == target_arn][0]
    for tgt in client.describe_target_health(TargetGroupArn=target_arn)['TargetHealthDescriptions']:
        inst_info = db.get_item(
            models.Instance, resource_id=tgt['Target']['Id'])
        if not inst_info:
            inst_info = {}
        item = {
            'resource_id': tgt['Target']['Id'],
            'name': inst_info.get('name', ''),
            'az': inst_info.get('az', ''),
            'target_port': tgt['Target']['Port'],
            'target_protocol': tgt_group['Protocol'],
        }
        data.append(item)
    return data


if __name__ == "__main__":
    sync_elbs()
