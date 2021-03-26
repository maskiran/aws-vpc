import datetime
from aws_utils import get_boto3_resource, add_tags_as_keys, get_name_tag, normalize_tags_list
import db
import models


def sync_subnets(region='us-east-1'):
    cur_date = datetime.datetime.utcnow()
    ec2 = get_boto3_resource('ec2', region)
    for page in ec2.get_paginator('describe_subnets').paginate():
        page_items = []
        for item in page['Subnets']:
            if 'Tags' not in item:
                item['Tags'] = []
            info = {
                'date_added': cur_date,
                'region': region,
                'account_id': item['OwnerId'],
                'resource_id': item['SubnetId'],
                'name': get_name_tag(item['Tags'], item['SubnetId']),
                'tags': normalize_tags_list(item['Tags']),
                'vpc_id': item['VpcId'],
                'cidr': item['CidrBlock'],
                'az': item['AvailabilityZone'],
                'arn': item['SubnetArn'],
            }
            info['vpc_name'] = db.get_item(models.Vpc, vpc_id=item['VpcId'])['name']
            add_tags_as_keys(info, item['Tags'])
            page_items.append(info)
        db.replace_items(models.Subnet, page_items)
    db.delete_items(models.Subnet, date_added__ne=cur_date)


def link_route_tables():
    """
    add route table name, id to the subnets
    """
    subnets = db.get_items(models.Subnet, json_output=False, page_size=0)
    for subnet in subnets:
        # find if there is an explicit route table for this subnet,
        # if not add the main/default rtable and link it both ways
        rtables = models.RouteTable.objects(subnets=subnet.resource_id)
        if len(rtables) > 0:
            # explicit route table is associated
            rtable = rtables[0]
        else:
            # implicit/default route table is associated
            rtables = models.RouteTable.objects(main=True, vpc_id=subnet.vpc_id)
            rtable = rtables[0]
        subnet.route_table = models.SubnetRouteTable(name=rtable.name,
            resource_id=rtable.resource_id)
        subnet.save()


if __name__ == "__main__":
    sync_subnets()
