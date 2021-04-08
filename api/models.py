import datetime
import inspect
from mongoengine import Document, DynamicDocument, StringField, IntField, DateTimeField, ListField, DictField, BooleanField, EmbeddedDocument, EmbeddedDocumentField, MapField


def create_indexes():
    # add indices for each of the models separately
    cur_module = globals()
    for m in cur_module:
        if m == 'BaseDocument':
            continue
        mod_class = cur_module[m]
        if inspect.isclass(mod_class) and issubclass(mod_class, BaseDocument):
            col = mod_class._get_collection()
            col.create_index([('$**', 'text')], name='search')
            col.create_index('resource_id', name='resource_id')
            col.create_index('tags', name='tags')
            col.create_index('name', name='name')
            col.create_index('vpc_id', name='vpc_id')
            col.create_index('region', name='region')
            col.create_index('account', name='account_id')


class BaseDocument(DynamicDocument):
    date_added = DateTimeField()
    account_id = StringField()
    region = StringField()
    name = StringField()
    tags = ListField(DictField(), default=[])
    search = StringField()
    resource_id = StringField()
    # enable text search on 'search' field
    meta = {
        'auto_create_index': False,
        'indexes': [
            'region',
            'account_id',
            'tags',
            'name'
        ],
        'abstract': True
    }


class Account(Document):
    name = StringField()
    role_arn = StringField()
    access_key = StringField()
    secret_key = StringField()
    regions = ListField(StringField(), default=['us-east-1'])
    csp = StringField(default='aws')
    account_number = StringField()
    last_updated = DateTimeField()


class Vpc(BaseDocument):
    pass


class Subnet(BaseDocument):
    pass


class SecurityGroup(BaseDocument):
    pass


class RouteTable(BaseDocument):
    pass


class Instance(BaseDocument):
    pass


class LoadBalancer(BaseDocument):
    pass


class TgwAttachment(BaseDocument):
    pass
