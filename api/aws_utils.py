import boto3
from botocore.config import Config
import models


def get_assumed_role_credentials(role_arn):
    # role_arn = 'arn:aws:iam::902505820678:role/mainaccount'
    sts = boto3.client('sts')
    assumed_role = sts.assume_role(
        RoleArn=role_arn, RoleSessionName='caller')
    creds = assumed_role['Credentials']
    return {
        'aws_access_key_id': creds['AccessKeyId'],
        'aws_secret_access_key': creds['SecretAccessKey'],
        'aws_session_token': creds['SessionToken'],
    }


def get_credentials_for_account(account_name='', account_number=''):
    # use either account name or number to get the credentials
    query = {}
    if account_name:
        query['name'] = account_name
    elif account_number:
        query['account_number'] = str(account_number)
    account = models.Account.objects(**query).first()
    if account:
        rsp = {
            'aws_access_key_id': account.access_key,
            'aws_secret_access_key': account.secret_key,
            'role_arn': account.role_arn
        }
    else:
        rsp = {}
    return rsp


def get_boto3_resource(resource_name, region='us-east-1', creds=None, account_number=''):
    # provide either creds (with aws_access_key_id and aws_secret_access_key) or account_number
    # to use the default values from .aws/credentials you can leave both empty
    config = Config(
        retries={
            'max_attempts': 100,
            'mode': 'standard'
        }
    )
    if account_number:
        creds = get_credentials_for_account(account_number=account_number)
    if creds is None:
        creds = {}
    # check if creds have a role to assume
    if 'role_arn' in creds:
        role_arn = creds.pop('role_arn')
        if role_arn:
            creds = get_assumed_role_credentials(creds['role_arn'])
    # no role_arn: so the creds have the access_key and secret or
    # or None so boto3 can read from default locations
    # (env AWS_PROFILE or default .aws/creds or instance metadata)
    client = boto3.client(resource_name, region_name=region,
                          config=config, **creds)
    if not account_number:
        if resource_name == 'sts':
            sts = client
        else:
            sts = boto3.client('sts', region_name=region, config=config, **creds)
        account_number = sts.get_caller_identity()['Account']
    return client, account_number


def get_name_tag(tags_list, default_value='noname'):
    name_value = default_value
    for tag in tags_list:
        if tag['Key'] == 'Name' or tag['Key'] == 'name':
            name_value = tag['Value']
            break
    # tag could be empty string, in that case return default_value
    if not name_value:
        name_value = default_value
    return name_value


def tags_list_to_dict(tags_list):
    # converts a list of tags to a dict with key as 'tag:<key>'
    data = {}
    for tag in tags_list:
        key = 'tag_' + \
            tag['Key'].replace(':', '_').replace('/', '_').replace('.', '_')
        data[key] = tag['Value']
    return data


def normalize_tags_list(tags_list):
    """
    tags_list is a list of dicts with Key and Value attributes. convert the field names to lower case
    """
    return [{'key': tag['Key'], 'value': tag['Value']} for tag in tags_list]


def add_tags_as_keys(data, tags_list):
    if tags_list is None:
        return
    if len(tags_list) == 0:
        return
    tags_dict = tags_list_to_dict(tags_list)
    data.update(tags_dict)
    data['_dynamic_cols'] = list(tags_dict.keys())


def format_routes_attribute(routes_attribute, ec2_resource):
    for route in routes_attribute:
        if 'GatewayId' in route:
            route['NextHop'] = route['GatewayId']
            if route['NextHop'] != 'local':
                route['NextHopName'] = get_name_tag(ec2_resource.InternetGateway(
                    route['GatewayId']).tags, route['GatewayId'])
        elif 'TransitGatewayId' in route:
            route['NextHop'] = route['TransitGatewayId']
            route['NextHopName'] = get_name_tag(ec2_resource.meta.client.describe_transit_gateways(TransitGatewayIds=[
                                                route['TransitGatewayId']])['TransitGateways'][0]['Tags'], route['TransitGatewayId'])
        elif 'NetworkInterfaceId' in route:
            route['NextHop'] = route['NetworkInterfaceId']
            route['NextHopName'] = ec2_resource.NetworkInterface(
                route['NetworkInterfaceId']).description
