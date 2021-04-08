import datetime
import logging
from aws_utils import get_boto3_resource, add_tags_as_keys, get_name_tag, normalize_tags_list
import db
import models


def sync(account_number, region, vpc_id='', subnet_id=''):
    cur_date = datetime.datetime.utcnow()
    client, account_id = get_boto3_resource('ec2', region,
                                            account_number=account_number)
    logging.info('Syncing Subnets %s %s %s', account_id, region, vpc_id)
    query = []
    if vpc_id:
        query.append({'Name': 'vpc-id', 'Values': [vpc_id]})
    if subnet_id:
        query.append({'Name': 'subnet-id', 'Values': [subnet_id]})
    added = 0
    for page in client.get_paginator('describe_subnets').paginate(Filters=query):
        logging.info('Got page with item count %s', len(page['Subnets']))
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
                'vpc_name': db.get_item(models.Vpc, resource_id=item['VpcId']).get('name', ''),
                'cidr': item['CidrBlock'],
                'az': item['AvailabilityZone'],
                'arn': item['SubnetArn'],
                'route_table': get_route_table(region, item['VpcId'], item['SubnetId'])
            }
            add_tags_as_keys(info, item['Tags'])
            page_items.append(info)
            added += 1
        db.replace_items(models.Subnet, page_items)
    logging.info('Addition done')
    del_query = {
        'region': region,
        'account_id': str(account_id),
        'date_added__ne': cur_date,
    }
    if vpc_id:
        del_query['vpc_id'] = vpc_id
    if subnet_id:
        del_query['resource_id'] = subnet_id
    deleted = db.delete_items(models.Subnet, **del_query)
    logging.info('Delete done')
    rsp = {'added': added, 'deleted': deleted}
    logging.info(rsp)
    return rsp


def get_route_table(region, vpc_id, subnet_id):
    """
    add route table name, id to the subnets
    """
    # find if there is an explicit route table for this subnet,
    # if not add the main/default rtable
    rtables = models.RouteTable.objects(
        subnets=subnet_id, region=region)
    rtable = {}
    if len(rtables) > 0:
        # explicit route table is associated
        rtable = rtables[0]
    else:
        # implicit/default route table is associated
        rtables = models.RouteTable.objects(
            main=True, vpc_id=vpc_id, region=region)
        if len(rtables) > 0:
            rtable = rtables[0]
    if rtable:
        return {'name': rtable.name, 'resource_id': rtable.resource_id}
    else:
        return {'name': '', 'resource_id': ''}
