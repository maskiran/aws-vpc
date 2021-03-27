import datetime
from aws_utils import get_boto3_resource, add_tags_as_keys, get_name_tag, normalize_tags_list
import db
import models


def sync_route_tables(region="us-east-1"):
    cur_date = datetime.datetime.utcnow()
    ec2 = get_boto3_resource('ec2', region)
    for page in ec2.get_paginator('describe_route_tables').paginate():
        page_items = []
        for item in page['RouteTables']:
            if 'Tags' not in item:
                item['Tags'] = []
            info = {
                'date_added': cur_date,
                'region': region,
                'account_id': item['OwnerId'],
                'resource_id': item['RouteTableId'],
                'name': get_name_tag(item['Tags'], item['RouteTableId']),
                'tags': normalize_tags_list(item['Tags']),
                'vpc_id': item['VpcId'],
                'vpc_name': db.get_item(models.Vpc, vpc_id=item['VpcId'])['name'],
                'subnets': [assoc['SubnetId'] for assoc in item['Associations'] if not assoc['Main']],
                'routes': get_routes(item['Routes']),
                'main': is_main_rtable(item)
            }
            add_tags_as_keys(info, item['Tags'])
            page_items.append(info)
        db.replace_items(models.RouteTable, page_items)
    db.delete_items(models.RouteTable, date_added__ne=cur_date)


def get_routes(route_list):
    new_routes_list = []
    for item in route_list:
        route = {}
        if 'DestinationCidrBlock' in item:
            route['destination'] = item['DestinationCidrBlock']
        elif 'DestinationPrefixListId' in item:
            route['destination'] = item['DestinationPrefixListId']
        if 'GatewayId' in item:
            route['next_hop'] = item['GatewayId']
        elif 'TransitGatewayId' in item:
            route['next_hop'] = item['TransitGatewayId']
        elif 'NetworkInterfaceId' in item:
            route['next_hop'] = item['NetworkInterfaceId']
        new_routes_list.append(route)
    return new_routes_list


def is_main_rtable(route_table):
    """
    check if this is the main/default route table for the vpc
    """
    main = False
    for assoc in route_table['Associations']:
        main = assoc['Main']
        if main is True:
            break
    return main


if __name__ == "__main__":
    sync_route_tables()
