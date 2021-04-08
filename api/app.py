import inspect
from flask import Flask, request
from mongoengine import connect
import models
import db
import apiresources.dashboard
import apiresources.vpc
import apiresources.instance
import apiresources.route_table
import apiresources.security_group
import apiresources.subnet
import apiresources.load_balancer
import apiresources.crawl
import apiresources.account
import apiresources.tgw_attachment

app = Flask(__name__)

db.get_connection()


@app.route('/init')
def init_indices():
    models.create_indexes()
    return 'indexes created\n'


app.register_blueprint(apiresources.crawl.app, url_prefix='/crawl')
app.register_blueprint(apiresources.dashboard.app,
                       url_prefix='/dashboard')
app.register_blueprint(apiresources.vpc.app, url_prefix='/vpcs')
app.register_blueprint(apiresources.subnet.app, url_prefix='/subnets')
app.register_blueprint(apiresources.route_table.app,
                       url_prefix='/route-tables')
app.register_blueprint(apiresources.security_group.app,
                       url_prefix='/security-groups')
app.register_blueprint(apiresources.instance.app, url_prefix='/instances')
app.register_blueprint(apiresources.load_balancer.app,
                       url_prefix='/load-balancers')
app.register_blueprint(apiresources.account.app, url_prefix='/accounts')
app.register_blueprint(apiresources.tgw_attachment.app, url_prefix='/tgw-attachments')


if __name__ == "__main__":
    app.run(debug=True)
