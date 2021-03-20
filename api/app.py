import inspect
from flask import Flask, request
from mongoengine import connect
import models
import apiresources.vpc
import apiresources.instance
import apiresources.route_table
import apiresources.security_group
import apiresources.subnet

app = Flask(__name__)


@app.route('/init')
def init_indices():
    # add indices for each of the models separately
    for m in dir(models):
        if m == 'BaseDocument':
            continue
        mod_class = getattr(models, m)
        if inspect.isclass(mod_class) and issubclass(mod_class, models.BaseDocument):
            col = mod_class._get_collection()
            col.create_index([('$**', 'text')], name='search')
            col.create_index('resource_id', name='resource_id')
            col.create_index('tags', name='tags')
            col.create_index('name', name='name')
    return 'done'


app.register_blueprint(apiresources.vpc.app, url_prefix='/vpcs')
app.register_blueprint(apiresources.subnet.app, url_prefix='/subnets')
app.register_blueprint(apiresources.route_table.app, url_prefix='/route-tables')
app.register_blueprint(apiresources.security_group.app, url_prefix='/security-groups')
app.register_blueprint(apiresources.instance.app, url_prefix='/instances')


if __name__ == "__main__":
    app.run(debug=True)
