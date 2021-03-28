import copy
import datetime
from aws_utils import get_boto3_resource, add_tags_as_keys, get_name_tag, normalize_tags_list
import db
import models
import aws_resources.common


def sync(region='us-east-1', vpc_id=''):
    cur_date = datetime.datetime.utcnow()
    ec2 = get_boto3_resource('ec2', region)
    query = []
    if vpc_id:
        query = [{'Name': 'vpc-id', 'Values': [vpc_id]}]
    iam = get_boto3_resource('iam')
    added = 0
    for page in ec2.get_paginator('describe_instances').paginate(Filters=query):
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
    del_query = {
        'region': region,
        'date_added__ne': cur_date,
    }
    if vpc_id:
        del_query['vpc_id'] = vpc_id
    deleted = db.delete_items(models.Instance, **del_query)
    return {'added': added, 'deleted': deleted}


def get_network_interfaces(rsp_interfaces_list):
    interfaces = []
    for intf in rsp_interfaces_list:
        # subnet_details = db.get_item(
        #     models.Subnet, resource_id=intf['SubnetId'])
        interfaces.append({
            'resource_id': intf['NetworkInterfaceId'],
            'mac': intf['MacAddress'],
            'private_ip': intf['PrivateIpAddress'],
            'public_ip': intf.get('Association', {}).get('PublicIp', ''),
            'subnet': {
                'resource_id': intf['SubnetId'],
                # 'name': subnet_details['name']
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
        # import pprint; pprint.pprint(rsp)
        if len(rsp['InstanceProfile']['Roles']) > 0:
            role_info = rsp['InstanceProfile']['Roles'][0]
    instance_item['iam_role_name'] = role_info.get('RoleName', '')
    instance_item['iam_role_arn'] = role_info.get('Arn', '')


def add_reference_info(region='us-east-1', vpc_id=''):
    query = aws_resources.common.get_query_dict(region, vpc_id)
    for vm in models.Instance.objects(**query):
        vm.vpc_name = db.get_item(models.Vpc, resource_id=vm.vpc_id)['name']
        # since this is a dynamic document, the entire attribute needs to be reset
        network_interfaces = copy.deepcopy(vm.network_interfaces)
        for intf in network_interfaces:
            subnet = intf['subnet']
            subnet['name'] = db.get_item(models.Subnet,
                                         resource_id=intf['subnet']['resource_id'])['name']
            intf['subnet'] = subnet
        vm.network_interfaces = network_interfaces
        vm.save()


if __name__ == "__main__":
    sync()
