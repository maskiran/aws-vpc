import datetime
from aws_utils import get_boto3_resource, add_tags_as_keys, get_name_tag, normalize_tags_list
import db
import models


def sync_vpcs(region='us-east-1'):
    cur_date = datetime.datetime.utcnow()
    ec2 = get_boto3_resource('ec2', region)
    for page in ec2.get_paginator('describe_vpcs').paginate():
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
        db.replace_items(models.Vpc, page_items)
    db.delete_items(models.Vpc, date_added__ne=cur_date)


if __name__ == "__main__":
    sync_vpcs()
