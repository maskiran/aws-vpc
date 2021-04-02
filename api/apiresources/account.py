from flask import Blueprint, request
from aws_utils import get_boto3_resource
import db
import models

app = Blueprint('account', __name__)


@app.route('', strict_slashes=False, methods=['GET', 'POST'])
def account_list():
    if request.method == 'GET':
        items = db.get_items(models.Account, **request.args)
        # dont send the secret_key
        [i.pop('secret_key') for i in items['items']]
        return items
    elif request.method == 'POST':
        data = request.json
        creds = {
            'aws_access_key_id': data.get('access_key', ''),
            'aws_secret_access_key': data.get('secret_key', ''),
            'role_arn': data.get('role_arn', '')
        }
        data['regions'] = data['regions'].split(",")
        _, account_id = get_boto3_resource('sts', creds=creds)
        models.Account(account_number=account_id, **data).save()
        return data['name']

@app.route('/<name>', methods=['DELETE'])
def account(name):
    if request.method == 'DELETE':
        count = db.delete_items(models.Account, name=name)
        return {'deleted': count}