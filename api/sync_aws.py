import argparse
from multiprocessing import Process, Queue
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
    args = parser.parse_args()
    return args


def wrapper_func_to_qput(q, fn, output_key, region, vpc_id):
    rsp = fn(region, vpc_id)
    q.put({output_key: rsp})


def sync_resources(region, vpc_id=''):
    rsp = {}
    print('Sync VPCs')
    rsp['vpcs'] = aws_resources.vpc.sync(region, vpc_id)
    q = Queue()
    # rtable and sg can run in parallel
    rt_process = Process(target=wrapper_func_to_qput,
                         args=(q, aws_resources.route_table.sync, 'route-tables', region, vpc_id))
    sg_process = Process(target=wrapper_func_to_qput,
                         args=(q, aws_resources.security_group.sync, 'security-groups', region, vpc_id))
    print('Sync rtables')
    print('Sync security groups')
    rt_process.start()
    sg_process.start()
    print('Wait rtables')
    print('Wait security groups')
    rt_process.join()
    sg_process.join()
    rsp.update(q.get())
    rsp.update(q.get())
    print('Sync subnets')
    rsp['subnets'] = aws_resources.subnet.sync(region, vpc_id)
    in_process = Process(target=wrapper_func_to_qput,
                         args=(q, aws_resources.instance.sync, 'instances', region, vpc_id))
    clb_process = Process(target=wrapper_func_to_qput,
                          args=(q, aws_resources.classic_lb.sync, 'classic-load-balancers', region, vpc_id))
    elb_process = Process(target=wrapper_func_to_qput,
                          args=(q, aws_resources.elastic_lb.sync, 'elastic-load-balancers', region, vpc_id))
    print('Sync instance')
    print('Sync classic lb')
    print('Sync elastic lb')
    in_process.start()
    clb_process.start()
    elb_process.start()
    print('Wait instance')
    print('Wait classic lb')
    print('Wait elastic lb')
    in_process.join()
    clb_process.join()
    elb_process.join()
    rsp.update(q.get())
    rsp.update(q.get())
    rsp.update(q.get())
    # rsp['vpcs'] = aws_resources.vpc.sync(region, vpc_id)
    # rsp['route-tables'] = aws_resources.route_table.sync(region, vpc_id)
    # rsp['subnets'] = aws_resources.subnet.sync(region, vpc_id)
    # rsp['security-groups'] = aws_resources.security_group.sync(region, vpc_id)
    # rsp['instances'] = aws_resources.instance.sync(region, vpc_id)
    # rsp['classic-load-balancers'] = aws_resources.classic_lb.sync(
    #     region, vpc_id)
    # rsp['elastic-load-balancers'] = aws_resources.elastic_lb.sync(
    #     region, vpc_id)
    return rsp


def main():
    args = parse_args()
    regions = args.region.split(',')
    for region in regions:
        rsp = sync_resources(region)
        pprint(rsp)


if __name__ == "__main__":
    main()
