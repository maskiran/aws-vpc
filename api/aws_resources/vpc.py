import datetime
from aws_utils import get_boto3_resource, add_tags_as_keys, get_name_tag, normalize_tags_list
import db
import models


def sync(region='us-east-1', vpc_id=''):
    cur_date = datetime.datetime.utcnow()
    client = get_boto3_resource('ec2', region)
    query = []
    if vpc_id:
        query = [{'Name': 'vpc-id', 'Values': [vpc_id]}]
    added = 0
    for page in client.get_paginator('describe_vpcs').paginate(Filters=query):
        page_items = []
        for item in page['Vpcs']:
            if 'Tags' not in item:
                item['Tags'] = []
            info = {
                'date_added': cur_date,
                'region': region,
                'account_id': item['OwnerId'],
                'resource_id': item['VpcId'],
                'vpc_id': item['VpcId'],
                'name': get_name_tag(item['Tags'], item['VpcId']),
                'tags': normalize_tags_list(item['Tags']),
                'cidr': [x['CidrBlock'] for x in item['CidrBlockAssociationSet']],
            }
            add_tags_as_keys(info, item['Tags'])
            page_items.append(info)
            added += 1
        db.replace_items(models.Vpc, page_items)
    del_query = {
        'region': region,
        'date_added__ne': cur_date,
    }
    if vpc_id:
        del_query['vpc_id'] = vpc_id
    deleted = db.delete_items(models.Vpc, **del_query)
    return {'added': added, 'deleted': deleted}


if __name__ == "__main__":
    sync()
