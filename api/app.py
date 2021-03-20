from flask import Flask, request
from mongoengine import connect
import apiresources.vpc
# import apiresources.instance
# import resources.route_table
# import resources.security_group
# import resources.subnet

app = Flask(__name__)

app.register_blueprint(apiresources.vpc.app, url_prefix='/vpcs')
# app.register_blueprint(resources.subnet.app, url_prefix='/subnets')
# app.register_blueprint(resources.security_group.app,
#                        url_prefix='/security-groups')
# app.register_blueprint(resources.route_table.app, url_prefix='/route-tables')
# app.register_blueprint(resources.instance.app, url_prefix='/instances')


if __name__ == "__main__":
    app.run(debug=True)
