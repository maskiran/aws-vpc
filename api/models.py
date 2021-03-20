import datetime
from mongoengine import Document, DynamicDocument, StringField, IntField, DateTimeField, ListField, DictField, BooleanField, EmbeddedDocument, EmbeddedDocumentField, MapField


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


class Vpc(BaseDocument):
    pass


class SubnetRouteTable(EmbeddedDocument):
    '''
    Route table that is associed with the subnet
    '''
    name = StringField(default="")
    resource_id = StringField(default="")


class Subnet(BaseDocument):
    route_table = EmbeddedDocumentField(SubnetRouteTable)


class SecurityGroup(BaseDocument):
    pass


class RouteTableSubnet(EmbeddedDocument):
    '''
    Subnets that are associated to the route table
    '''
    name = StringField(default="")
    resource_id = StringField(default="")


class RouteTable(BaseDocument):
    subnet_details = ListField(EmbeddedDocumentField(RouteTableSubnet))


class Instance(BaseDocument):
    pass
