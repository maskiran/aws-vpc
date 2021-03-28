import datetime
from aws_utils import get_boto3_resource, add_tags_as_keys, get_name_tag, normalize_tags_list
import db
import models
import aws_resources.common


def sync(region='us-east-1', vpc_id=''):
    cur_date = datetime.datetime.utcnow()
    client = get_boto3_resource('ec2', region)
    query = []
    if vpc_id:
        query = [{'Name': 'vpc-id', 'Values': [vpc_id]}]
    added = 0
    for page in client.get_paginator('describe_subnets').paginate(Filters=query):
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
            add_tags_as_keys(info, item['Tags'])
            page_items.append(info)
            added += 1
        db.replace_items(models.Subnet, page_items)
    del_query = {
        'region': region,
        'date_added__ne': cur_date,
    }
    if vpc_id:
        del_query['vpc_id'] = vpc_id
    deleted = db.delete_items(models.Subnet, **del_query)
    return {'added': added, 'deleted': deleted}


def add_reference_info(region='us-east-1', vpc_id=''):
    """
    add route table name, id to the subnets
    """
    query = aws_resources.common.get_query_dict(region, vpc_id)
    for subnet in models.Subnet.objects(**query):
        # find if there is an explicit route table for this subnet,
        # if not add the main/default rtable
        rtables = models.RouteTable.objects(
            subnets=subnet.resource_id, region=region)
        if len(rtables) > 0:
            # explicit route table is associated
            rtable = rtables[0]
        else:
            # implicit/default route table is associated
            rtables = models.RouteTable.objects(
                main=True, vpc_id=subnet.vpc_id, region=region)
            rtable = rtables[0]
        subnet.route_table = {
            'name': rtable.name,
            'resource_id': rtable.resource_id
        }
        # get the vpc name also as part of the this post processing
        subnet.vpc_name = db.get_item(models.Vpc, resource_id=subnet.vpc_id)['name']
        subnet.save()


if __name__ == "__main__":
    sync()
    add_reference_info()
