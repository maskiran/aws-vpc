import copy
import datetime
import logging
from aws_utils import get_boto3_resource, add_tags_as_keys, get_name_tag, normalize_tags_list
import db
import models


def sync(region, account_number, vpc_id='', security_group_id=''):
    cur_date = datetime.datetime.utcnow()
    client, account_id = get_boto3_resource('ec2', region,
                                            account_number=account_number)
    logging.info('Syncing Security Groups %s %s %s',
                 account_id, region, vpc_id)
    query = []
    if vpc_id:
        query.append({'Name': 'vpc-id', 'Values': [vpc_id]})
    if security_group_id:
        query.append({'Name': 'group-id', 'Values': [security_group_id]})
    added = 0
    for page in client.get_paginator('describe_security_groups').paginate(Filters=query):
        logging.info('Got page with item count %s',
                     len(page['SecurityGroups']))
        page_items = []
        for item in page['SecurityGroups']:
            if 'Tags' not in item:
                item['Tags'] = []
            info = {
                'date_added': cur_date,
                'region': region,
                'account_id': item['OwnerId'],
                'resource_id': item['GroupId'],
                'name': item['GroupName'],
                'tags': normalize_tags_list(item['Tags']),
                'vpc_id': item['VpcId'],
                'vpc_name': db.get_item(models.Vpc, resource_id=item['VpcId'])['name'],
                'ingress_rules': get_rules(item['IpPermissions'], "source"),
                'egress_rules': get_rules(item['IpPermissionsEgress'], "destination"),
            }
            add_tags_as_keys(info, item['Tags'])
            page_items.append(info)
            added += 1
        db.replace_items(models.SecurityGroup, page_items)
    logging.info('Addition done')
    del_query = {
        'region': region,
        'account_id': str(account_id),
        'date_added__ne': cur_date,
    }
    if vpc_id:
        del_query['vpc_id'] = vpc_id
    if security_group_id:
        del_query['resource_id'] = security_group_id
    deleted = db.delete_items(models.SecurityGroup, **del_query)
    logging.info('Delete done')
    rsp = {'added': added, 'deleted': deleted}
    logging.info(rsp)
    return rsp


def get_rules(rule_list, target_type="source"):
    # target_type: source - for ingress, dst - for egress
    new_rule_list = []
    for item in rule_list:
        rule = {}
        rule['protocol'] = item['IpProtocol']
        rule['start_port'] = item.get('FromPort', 0)
        rule['end_port'] = item.get('ToPort', 0)
        # normalize rules by splitting for each cidr/security group
        for ip in item['IpRanges']:
            ip_rule = copy.deepcopy(rule)
            ip_rule['source'] = ip['CidrIp']
            ip_rule['description'] = ip.get('Description', "")
            new_rule_list.append(ip_rule)
        for sg in item['UserIdGroupPairs']:
            sg_rule = copy.deepcopy(rule)
            sg_rule['source'] = sg['GroupId']
            sg_rule['description'] = sg.get('Description', "")
            new_rule_list.append(sg_rule)
    return new_rule_list
