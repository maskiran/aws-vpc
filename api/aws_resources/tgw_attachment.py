import datetime
import logging
from aws_utils import get_boto3_resource, add_tags_as_keys, get_name_tag, normalize_tags_list
import db
import models

def sync(account_number, region, vpc_id='', attachment_id=''):
    cur_date = datetime.datetime.utcnow()
    client, account_id = get_boto3_resource('ec2', region,
                                            account_number=account_number)
    logging.info('Syncing TGW Attachments %s %s %s',
                 account_id, region, vpc_id)
    query = []
    if vpc_id:
        query.append({'Name': 'vpc-id', 'Values': [vpc_id]})
    if attachment_id:
        query.append({'Name': 'transit-gateway-attachment-id', 'Values': [attachment_id]})
    added = 0
    for page in client.get_paginator('describe_transit_gateway_vpc_attachments').paginate(
            Filters=query, PaginationConfig={'PageSize': 20}):
        logging.info('Got page with item count %s',
                     len(page['TransitGatewayVpcAttachments']))
        page_items = []
        for item in page['TransitGatewayVpcAttachments']:
            if item['State'] != 'available':
                continue
            if 'Tags' not in item:
                item['Tags'] = []
            info = {
                'date_added': cur_date,
                'region': region,
                'account_id': account_id,
                'resource_id': item['TransitGatewayAttachmentId'],
                'transit_gateway_id': item['TransitGatewayId'],
                'vpc_id': item['VpcId'],
                'vpc_name': db.get_item(models.Vpc, resource_id=item['VpcId']).get('name', ''),
                'subnets': get_subnets(item['SubnetIds']),
                'name': get_name_tag(item['Tags'], item['TransitGatewayAttachmentId']),
                'tags': normalize_tags_list(item['Tags']),
                'route_table_id': item.get('Association', {}).get('TransitGatewayRouteTableId', '')
            }
            add_tags_as_keys(info, item['Tags'])
            page_items.append(info)
            added += 1
        set_attachment_route_table(client, page_items)
        db.replace_items(models.TgwAttachment, page_items)
    logging.info('Addition done')
    del_query = {
        'region': region,
        'account_id': account_id,
        'date_added__ne': cur_date,
    }
    if vpc_id:
        del_query['vpc_id'] = vpc_id
    if attachment_id:
        del_query['resource_id'] = attachment_id
    deleted = db.delete_items(models.TgwAttachment, **del_query)
    logging.info('Delete done')
    rsp = {'added': added, 'deleted': deleted}
    logging.info(rsp)
    return rsp


def get_subnets(subnet_list):
    data = []
    for subnet in subnet_list:
        details = db.get_item(models.Subnet, resource_id=subnet)
        data.append({
            'name': details.get('name', ''),
            'resource_id': subnet,
            'route_table_id': details.get('route_table', {}).get('resource_id')
        })
    return data


def set_attachment_route_table(client, vpc_attachment_list):
    attachment_ids = [item['resource_id'] for item in vpc_attachment_list]
    rsp = client.describe_transit_gateway_attachments(
        TransitGatewayAttachmentIds=attachment_ids)
    # rearrange by attachment id
    all_attachments = {}
    for item in rsp['TransitGatewayAttachments']:
        all_attachments[item['TransitGatewayAttachmentId']] = item
    for item in vpc_attachment_list:
        assoc = all_attachments[item['resource_id']].get('Association', {})
        item['route_table_id'] = assoc.get('TransitGatewayRouteTableId', '')


def get_tgw_routes(region, account_number, rtable_id):
    client, _ = get_boto3_resource('ec2', region, account_number=account_number)
    query = [{'Name': 'state', 'Values': ['active']}]
    routes = []
    rsp = client.search_transit_gateway_routes(
        TransitGatewayRouteTableId=rtable_id, Filters=query)
    for route in rsp['Routes']:
        attachment = route['TransitGatewayAttachments'][0]
        routes.append({
            'destination': route['DestinationCidrBlock'],
            'vpc_id': attachment['ResourceId'],
            'tgw_attachment_id': attachment['TransitGatewayAttachmentId'],
            'vpc_name': db.get_item(models.Vpc, resource_id=attachment['ResourceId']).get('name', '')
        })
    return routes
