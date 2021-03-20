import datetime
from aws_utils import get_boto3_resource, add_tags_as_keys, get_name_tag, normalize_tags_list
import db
import models


def sync_instances(region='us-east-1'):
    cur_date = datetime.datetime.utcnow()
    ec2 = get_boto3_resource('ec2', region)
    for page in ec2.get_paginator('describe_instances').paginate():
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
                    'name': get_name_tag(item['Tags'], item['InstanceId']),
                    'tags': normalize_tags_list(item['Tags']),
                    'instance_type': item['InstanceType'],
                    'launch_time': item['LaunchTime'],
                    'key_name': item.get('KeyName', ''),
                    'vpc_id': item['VpcId'],
                    'network_interfaces': get_network_interfaces(item['NetworkInterfaces']),
                    'az': item['Placement']['AvailabilityZone'],
                    'state': item['State']['Name'],
                }
                add_tags_as_keys(info, item['Tags'])
                page_items.append(info)
        db.replace_items(models.Instance, page_items)
    db.delete_items(models.Instance, date_added__ne=cur_date)


def get_network_interfaces(rsp_interfaces_list):
    interfaces = []
    for intf in rsp_interfaces_list:
        subnet_details = db.get_item(models.Subnet, resource_id=intf['SubnetId'])
        interfaces.append({
            'mac': intf['MacAddress'],
            'private_ip': intf['PrivateIpAddress'],
            'subnet': intf['SubnetId'],
            'subnet': {
                'resource_id': intf['SubnetId'],
                'name': subnet_details['name']
            },
            'src_dst_check': intf['SourceDestCheck'],
            'security_groups': [{'name': sg['GroupName'], 'resource_id': sg['GroupId']}
                                for sg in intf['Groups']],
        })
    return interfaces


if __name__ == "__main__":
    sync_instances()
