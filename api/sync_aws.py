import argparse
from multiprocessing import Process, Queue
import aws_resources.vpc
import aws_resources.subnet
import aws_resources.route_table
import aws_resources.security_group
import aws_resources.instance
import aws_resources.classic_lb
import aws_resources.elastic_lb


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('-r', '--region', default='us-east-1',
                        help='comma separated region list to sync resources: e.g us-east-1,us-east-2')
    args = parser.parse_args()
    return args


def sync_resources(region, vpc_id=''):
    sync_functions = [
        aws_resources.vpc.sync,
        aws_resources.subnet.sync,
        aws_resources.route_table.sync,
        aws_resources.security_group.sync,
        aws_resources.instance.sync,
        aws_resources.classic_lb.sync,
        aws_resources.elastic_lb.sync
    ]
    jobs = []
    for fn in sync_functions:
        p = Process(target=fn, args=(region, vpc_id))
        print('Starting', fn)
        p.start()
        jobs.append(p)
    for job in jobs:
        print('waiting for', job)
        job.join()
    ref_functions = [
        aws_resources.subnet.add_reference_info,
        aws_resources.route_table.add_reference_info,
        aws_resources.security_group.add_reference_info,
        aws_resources.instance.add_reference_info,
        aws_resources.classic_lb.add_reference_info,
        aws_resources.elastic_lb.add_reference_info
    ]
    jobs = []
    for fn in ref_functions:
        p = Process(target=fn, args=(region, vpc_id))
        print('Starting', fn)
        p.start()
        jobs.append(p)
    for job in jobs:
        print('waiting for', job)
        job.join()


def main():
    args = parse_args()
    regions = args.region.split(',')
    for region in regions:
        sync_resources(region)


if __name__ == "__main__":
    main()
