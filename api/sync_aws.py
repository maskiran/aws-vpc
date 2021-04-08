import argparse
import datetime
import logging
import json
from multiprocessing import Process
from pprint import pprint
import sys
import time

from aws_utils import get_boto3_resource
import aws_resources.vpc
import aws_resources.subnet
import aws_resources.route_table
import aws_resources.security_group
import aws_resources.instance
import aws_resources.classic_lb
import aws_resources.elastic_lb
import aws_resources.tgw_attachment
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


def sync_resources(region, account_number, vpc_id='', new_connection=True):
    rsp = {}
    if new_connection:
        db.get_connection()
    logging.basicConfig(filemode='w', level=logging.INFO,
                        filename='/tmp/account-%s-%s' % (
                            account_number, region),
                        format="%(asctime)s %(message)s")
    logging.info('Syncing Account %s %s %s', account_number, region, vpc_id)
    rsp['vpcs'] = aws_resources.vpc.sync(region, account_number, vpc_id)
    rsp['route-tables'] = aws_resources.route_table.sync(
        region, account_number, vpc_id)
    rsp['subnets'] = aws_resources.subnet.sync(region, account_number, vpc_id)
    rsp['security-groups'] = aws_resources.security_group.sync(
        region, account_number, vpc_id)
    rsp['instances'] = aws_resources.instance.sync(
        region, account_number, vpc_id)
    rsp['classic-load-balancers'] = aws_resources.classic_lb.sync(
        region, account_number, vpc_id)
    rsp['elastic-load-balancers'] = aws_resources.elastic_lb.sync(
        region, account_number, vpc_id)
    rsp['tgw-attachments'] = aws_resources.tgw_attachment.sync(
        region, account_number, vpc_id)
    logging.info(json.dumps(rsp, indent=4))
    if new_connection:
        db.close()
    return rsp


def wait_for_processes(process_list):
    process_list = process_list[:]
    while len(process_list):
        finished = []
        for idx, p in enumerate(process_list):
            p.join(5)
            if p.is_alive():
                pass
            else:
                finished.append(idx)
                print(p.name, 'completed')
        # delete finished processes from the process_list
        for idx in sorted(finished, reverse=True):
            del(process_list[idx])


def main():
    # for each account and region do a sync in parallel (within account/region its sequential)
    print('Starting sync cycle at %s' % datetime.datetime.now())
    db.get_connection()
    accounts = []
    for account in db.get_items(models.Account, page_size=0, json_output=False):
        for region in account.regions:
            accounts.append([region, account.account_number])
    db.close()
    processes = []
    for account in accounts:
        # account  is [region, account_number]
        p = Process(target=sync_resources, args=(account),
                    name='%s-%s' % (account[1], account[0]))
        print(p.name, 'starting')
        p.start()
        processes.append(p)
    print('Started', len(processes), 'processes')
    wait_for_processes(processes)
    db.get_connection()
    for account in db.get_items(models.Account, page_size=0, json_output=False):
        account.last_updated = datetime.datetime.utcnow()
        account.save()
    db.close()
    print('Ending sync cycle at %s' % datetime.datetime.now())
    return


if __name__ == "__main__":
    while True:
        main()
        if len(sys.argv) >= 2:
            print('Sleep 10 mins')
            sys.stdout.flush()
            time.sleep(10 * 60)
            print('Wakeup sync cycle at %s' % datetime.datetime.now())
        else:
            break
