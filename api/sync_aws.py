import argparse
from pprint import pprint

import aws_resources.vpc
import aws_resources.subnet
import aws_resources.route_table
import aws_resources.security_group
import aws_resources.instance
import aws_resources.classic_lb
import aws_resources.elastic_lb
import db


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('-r', '--region', default='us-east-1',
                        help='comma separated region list to sync resources: e.g us-east-1,us-east-2')
    parser.add_argument('-v', '--vpc-id', default='',
                        help='selected vpc to sync')
    args = parser.parse_args()
    return args


def sync_resources(region, vpc_id=''):
    rsp = {}
    db.get_connection()
    print('Sync VPCs', region, vpc_id)
    rsp['vpcs'] = aws_resources.vpc.sync(region, vpc_id)
    print('Sync Route Tables', region, vpc_id)
    rsp['route-tables'] = aws_resources.route_table.sync(region, vpc_id)
    print('Sync Subnets', region, vpc_id)
    rsp['subnets'] = aws_resources.subnet.sync(region, vpc_id)
    print('Sync SecurityGroups', region, vpc_id)
    rsp['security-groups'] = aws_resources.security_group.sync(region, vpc_id)
    print('Sync Instances', region, vpc_id)
    rsp['instances'] = aws_resources.instance.sync(region, vpc_id)
    print('Sync Classic Load Balancers', region, vpc_id)
    rsp['classic-load-balancers'] = aws_resources.classic_lb.sync(
        region, vpc_id)
    print('Sync Network Load Balancers', region, vpc_id)
    rsp['elastic-load-balancers'] = aws_resources.elastic_lb.sync(
        region, vpc_id)
    return rsp


def main():
    args = parse_args()
    regions = args.region.split(',')
    for region in regions:
        rsp = sync_resources(region, args.vpc_id)
        pprint(rsp)


if __name__ == "__main__":
    main()
