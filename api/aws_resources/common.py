import db
import models


def add_vpc_name(model_cls, region='us-east-1', vpc_id=''):
    # add vpc name to the objects of model_cls
    query = get_query_dict(region, vpc_id)
    for obj in model_cls.objects(**query):
        vpc_name = db.get_item(models.Vpc, resource_id=obj.vpc_id)['name']
        obj.vpc_name = vpc_name
        obj.save()


def get_query_dict(region, vpc_id):
    query = {
        'region': region
    }
    if vpc_id:
        query['vpc_id'] = vpc_id
    return query
