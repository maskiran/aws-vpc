import copy
import datetime
from aws_utils import get_boto3_resource, add_tags_as_keys, get_name_tag, normalize_tags_list
import db
import models


def sync_security_groups(region='us-east-1'):
    cur_date = datetime.datetime.utcnow()
    ec2 = get_boto3_resource('ec2', region)
    for page in ec2.get_paginator('describe_security_groups').paginate():
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
                'vpc_name': db.get_item(models.Vpc, vpc_id=item['VpcId'])['name'],
                'ingress_rules': get_rules(item['IpPermissions'], "source"),
                'egress_rules': get_rules(item['IpPermissionsEgress'], "destination"),
            }
            add_tags_as_keys(info, item['Tags'])
            page_items.append(info)
        db.replace_items(models.SecurityGroup, page_items)
    db.delete_items(models.SecurityGroup, date_added__ne=cur_date)


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


if __name__ == "__main__":
    sync_security_groups()
