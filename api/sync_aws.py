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


def sync_account_region(account_number, region, vpc_id='', new_connection=True):
    rsp = {}
    if new_connection:
        db.get_connection()
    file_name = '/tmp/account-%s-%s' % (account_number, region)
    if vpc_id:
        file_name = '%s-%s' % (file_name, vpc_id)
    logging.basicConfig(filemode='w', level=logging.INFO,
                        filename=file_name,
                        format="%(asctime)s %(message)s")
    logging.info('Syncing Account %s %s %s', account_number, region, vpc_id)
    rsp['vpcs'] = aws_resources.vpc.sync(account_number, region, vpc_id)
    rsp['route-tables'] = aws_resources.route_table.sync(
        account_number, region, vpc_id)
    rsp['subnets'] = aws_resources.subnet.sync(account_number, region, vpc_id)
    rsp['security-groups'] = aws_resources.security_group.sync(
        account_number, region, vpc_id)
    rsp['instances'] = aws_resources.instance.sync(
        account_number, region, vpc_id)
    rsp['classic-load-balancers'] = aws_resources.classic_lb.sync(
        account_number, region, vpc_id)
    rsp['elastic-load-balancers'] = aws_resources.elastic_lb.sync(
        account_number, region, vpc_id)
    rsp['tgw-attachments'] = aws_resources.tgw_attachment.sync(
        account_number, region, vpc_id)
    logging.info(json.dumps(rsp, indent=4))
    if new_connection:
        db.close()
    return rsp


def wait_for_processes(processes_dict):
    while True:
        for pid in list(processes_dict):
            process = processes_dict[pid]
            if process.is_alive():
                continue
            print('Completed', process.name)
            process.join()
            del(processes_dict[pid])
        # if there are no processes left, break
        if not processes_dict:
            break
        else:
            time.sleep(5)


def sync_all_account_regions():
    # for each account and region do a sync in parallel (within account/region its sequential)
    print('Starting sync all accounts/regions at %s' % datetime.datetime.now())
    accounts = []
    db.get_connection()
    for account in models.Account.objects:
        for region in account.regions:
            accounts.append([account.account_number, region])
    db.close()
    processes = {}
    for account in accounts:
        # account is [account_number, region]
        pname = '%s-%s' % (account[0], account[1])
        p = Process(target=sync_account_region, args=(account), name=pname)
        print('Started', pname)
        p.start()
        processes[p.pid] = p
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
        sync_all_account_regions()
        if len(sys.argv) >= 2:
            print('Sleep 10 mins')
            sys.stdout.flush()
            time.sleep(10 * 60)
            print('Wakeup sync cycle at %s' % datetime.datetime.now())
        else:
            break
