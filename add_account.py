import argparse
import models
import db


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('name', help='account name')
    parser.add_argument('-a', '--access_key', help='access key', default='')
    parser.add_argument('-s', '--secret', help='secret key', default='')
    parser.add_argument('-r', '--role', default='',
                      help='arn of the cross account iam role')
    parser.add_argument('-g', '--regions', default='us-east-1',
                      help='comma separated string of regions to check resources')
    args = parser.parse_args()
    return args


def add_account(name, access_key, secret, role, regions):
    acct = models.Account(name=name, access_key=access_key, secret_key=secret,
                          role_arn=role, regions=regions.split(","))
    acct.save()


if __name__ == "__main__":
    db.get_connection()
    args = parse_args()
    add_account(args.name, args.access_key,
                args.secret, args.role, args.regions)
