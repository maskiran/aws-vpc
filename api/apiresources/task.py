from flask import Blueprint, request
import db
import models

app = Blueprint('task', __name__)


@app.route('', strict_slashes=False)
def task_list():
    return db.get_items(models.VpcSyncTask, sort='-start_date', **request.args)


@app.route('/iscrawling/<account>/<region>/<vpc_id>', strict_slashes=False)
def task(account, region, vpc_id):
    return db.get_item(models.VpcSyncTask, account_number=account, region=region,
                       vpc_id=vpc_id, state__in=['queued', 'running'])
