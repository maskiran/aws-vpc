import copy
import datetime
import logging
from aws_utils import get_boto3_resource, add_tags_as_keys, get_name_tag, normalize_tags_list
import db
import models


def sync(region, creds, vpc_id=''):
    cur_date = datetime.datetime.utcnow()
    client, account_id = get_boto3_resource('ec2', region, creds)
    logging.info('Syncing Instances %s %s %s', account_id, region, vpc_id)
    query = []
    if vpc_id:
        query = [{'Name': 'vpc-id', 'Values': [vpc_id]}]
    iam, _ = get_boto3_resource('iam', region, creds)
    added = 0
    for page in client.get_paginator('describe_instances').paginate(Filters=query):
        logging.info('Got page with reservation count %s',
                 len(page['Reservations']))
        page_items = []
        for reservation in page['Reservations']:
            for item in reservation['Instances']:
                if item['State']['Name'] == "terminated":
                    continue
                if 'Tags' not in item:
                    item['Tags'] = []
                info = {
                    'date_added': cur_date,
                    'region': region,
                    'account_id': reservation['OwnerId'],
                    'resource_id': item['InstanceId'],
                    'name': get_name_tag(item['Tags']),
                    'tags': normalize_tags_list(item['Tags']),
                    'instance_type': item['InstanceType'],
                    'launch_time': item['LaunchTime'],
                    'key_name': item.get('KeyName', ''),
                    'vpc_id': item['VpcId'],
                    'vpc_name': db.get_item(models.Vpc, resource_id=item['VpcId'])['name'],
                    'iam_instance_profile_arn': item.get('IamInstanceProfile', {}).get('Arn', ''),
                    'iam_instance_profile_name': item.get('IamInstanceProfile', {}).get('Arn', '').split('/')[-1],
                    'network_interfaces': get_network_interfaces(item['NetworkInterfaces']),
                    'az': item['Placement']['AvailabilityZone'],
                    'state': item['State']['Name'],
                }
                set_iam_role(info, iam)
                add_tags_as_keys(info, item['Tags'])
                page_items.append(info)
                added += 1
        db.replace_items(models.Instance, page_items)
    logging.info('Addition done')
    del_query = {
        'region': region,
        'account_id': account_id,
        'date_added__ne': cur_date,
    }
    if vpc_id:
        del_query['vpc_id'] = vpc_id
    deleted = db.delete_items(models.Instance, **del_query)
    logging.info('Delete done')
    rsp = {'added': added, 'deleted': deleted}
    logging.info(rsp)
    return rsp


def get_network_interfaces(rsp_interfaces_list):
    interfaces = []
    for intf in rsp_interfaces_list:
        subnet_details = db.get_item(
            models.Subnet, resource_id=intf['SubnetId'])
        interfaces.append({
            'resource_id': intf['NetworkInterfaceId'],
            'mac': intf['MacAddress'],
            'private_ip': intf['PrivateIpAddress'],
            'public_ip': intf.get('Association', {}).get('PublicIp', ''),
            'subnet': {
                'resource_id': intf['SubnetId'],
                'name': subnet_details['name']
            },
            'src_dst_check': intf['SourceDestCheck'],
            'security_groups': [{'name': sg['GroupName'], 'resource_id': sg['GroupId']}
                                for sg in intf['Groups']],
        })
    return interfaces


def set_iam_role(instance_item, iam):
    """
    from instance profile arn, find the attached iam role
    """
    role_info = {}
    if instance_item['iam_instance_profile_name']:
        rsp = iam.get_instance_profile(
            InstanceProfileName=instance_item['iam_instance_profile_name'])
        if len(rsp['InstanceProfile']['Roles']) > 0:
            role_info = rsp['InstanceProfile']['Roles'][0]
    instance_item['iam_role_name'] = role_info.get('RoleName', '')
    instance_item['iam_role_arn'] = role_info.get('Arn', '')


if __name__ == "__main__":
    sync()
