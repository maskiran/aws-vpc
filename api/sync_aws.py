import argparse
import logging
from multiprocessing import Pool
from pprint import pprint

from aws_utils import get_boto3_resource
import aws_resources.vpc
import aws_resources.subnet
import aws_resources.route_table
import aws_resources.security_group
import aws_resources.instance
import aws_resources.classic_lb
import aws_resources.elastic_lb
import db
import models


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('-r', '--region', default='',
                        help='comma separated region list to sync resources: e.g us-east-1,us-east-2')
    parser.add_argument('-v', '--vpc-id', default='',
                        help='selected vpc to sync')
    args = parser.parse_args()
    return args

def sync_resources(region, creds, vpc_id=''):
    rsp = {}
    db.get_connection()
    client, account_id = get_boto3_resource('ec2', region, creds)
    logging.basicConfig(filemode='w', level=logging.INFO,
                        filename='/tmp/account-%s-%s' % (account_id, region),
                        format="%(asctime)s %(message)s")
    logging.info('Syncing Account %s %s %s', account_id, region, vpc_id)
    rsp['vpcs'] = aws_resources.vpc.sync(region, creds, vpc_id)
    rsp['route-tables'] = aws_resources.route_table.sync(region, creds, vpc_id)
    rsp['subnets'] = aws_resources.subnet.sync(region, creds, vpc_id)
    rsp['security-groups'] = aws_resources.security_group.sync(region, creds, vpc_id)
    rsp['instances'] = aws_resources.instance.sync(region, creds, vpc_id)
    rsp['classic-load-balancers'] = aws_resources.classic_lb.sync(region, creds, vpc_id)
    rsp['elastic-load-balancers'] = aws_resources.elastic_lb.sync(region, creds, vpc_id)
    logging.info(rsp)
    return rsp


def main():
    # for each account and region do a sync in parallel (within account/region its sequential)
    db.get_connection()
    accounts = []
    for account in db.get_items(models.Account, page_size=0, json_output=False):
        for region in account.regions:
            creds = {
                'aws_access_key_id': account.access_key,
                'aws_secret_access_key': account.secret_key,
                'role_arn': account.role_arn
            }
            accounts.append([region, creds])
    db.close()
    Pool().starmap(sync_resources, accounts)
    return


if __name__ == "__main__":
    main()
