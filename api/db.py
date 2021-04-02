import datetime
import json
import os
from mongoengine import get_db, connect, disconnect
from pymongo import ReplaceOne


def get_connection():
    db_url = os.getenv('MONGODB_HOST', 'mongodb://localhost/aws')
    connect(host=db_url, connect=False)


def close():
    disconnect()


def create_item(model_cls_name, item):
    """
    add item dict to the db
    """
    obj = model_cls_name(**item)
    obj.save()


def create_items(model_cls_name, items_list):
    if len(items_list) == 0:
        return
    objs = []
    for item in items_list:
        objs.append(model_cls_name(**item))
    model_cls_name.objects.insert(objs)


def replace_items(model_cls_name, items_list):
    if len(items_list) == 0:
        return
    objs = []
    for item in items_list:
        op = ReplaceOne(
            {'resource_id': item['resource_id']},
            item,
            upsert=True
        )
        objs.append(op)
    model_cls_name._get_collection().bulk_write(objs)


def get_items(model_cls_name, json_output=True, page_size=25, page=1, sort='name', **kwargs):
    """
    Get a list of documents from the model_cls_name (models.<ClassName>).
    The query is provided as key-value pairs in kwargs.
    sort : sort field name (-name to sort in descending)
    page_size: number of documents to return
    page: page number
    json: True/False, return either json dict or raw mongoengine document instances
    """
    search = ''
    if 'search' in kwargs:
        search = kwargs.pop('search')
    if search:
        rsp = model_cls_name.objects(
            **kwargs).search_text(search).order_by('$text_score')
    else:
        rsp = model_cls_name.objects(
            **kwargs).collation({'locale': 'en', 'numericOrdering': True})
        if sort:
            rsp = rsp.order_by(sort)
    count = rsp.count()
    if page_size:
        page_size = int(page_size)
        page = int(page)
        start = (page - 1) * page_size
        end = start + page_size
        rsp = rsp[start:end]
    else:
        page_size = 0
        page = 1
    if json_output == False:
        return rsp
    docs = json.loads(rsp.to_json())
    for doc in docs:
        doc['id'] = doc['_id']['$oid']
        doc.pop('_id', None)
        if 'date_added' in doc:
            doc['date_added'] = doc['date_added']['$date']
        if 'last_updated' in doc:
            doc['last_updated'] = doc['last_updated']['$date']
    next_page = page + 1
    if (next_page - 1) * page_size >= rsp.count():
        next_page = -1
    prev_page = page - 1
    if prev_page < 0:
        prev_page = -1
    body = {
        'count': count,
        'page': page,
        'page_size': page_size,
        'next_page': next_page,
        'prev_page': prev_page,
        'items': docs,
    }
    return body


def get_item(model_cls_name, **kwargs):
    """
    Get one (first document) matching kwargs. Typically this is called
    primary/unique key like id in kwargs that should result on only one
    document. However this is flexible to return just the first document
    """
    item = model_cls_name.objects(**kwargs).first()
    if item:
        item = json.loads(item.to_json())
        item['id'] = item['_id']['$oid']
        item.pop('_id', None)
        if 'date_added' in item:
            item['date_added'] = item['date_added']['$date']
        if 'last_updated' in item:
            item['last_updated'] = item['last_updated']['$date']
        return item


def delete_items(model_cls_name, **kwargs):
    return model_cls_name.objects(**kwargs).delete()
