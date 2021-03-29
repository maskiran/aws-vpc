from flask import Blueprint, request
import db
import models
from sync_aws import sync_resources

app = Blueprint('crawl', __name__)


@app.route('/<region>/<vpc_id>')
def crawl(region, vpc_id):
    return sync_resources(region, vpc_id)
