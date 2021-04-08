import datetime
from multiprocessing import Process
import time
import db
import models
from sync_aws import sync_account_region


def sync(task_record):
    sync_account_region(task_record.account_number,
                        task_record.region,
                        task_record.vpc_id)


def sync_batch():
    processes = {}
    db.get_connection()
    for item in models.VpcSyncTask.objects(state='queued'):
        print('Processing', item.account_number, item.region, item.vpc_id)
        p = Process(target=sync, args=(item,))
        processes[item.id] = p
        item.state = 'running'
        item.start_date = datetime.datetime.utcnow()
        item.save()
    db.close()
    for p in processes.values():
        p.start()
        print(p.pid)
    # wait for the processes
    db.get_connection()
    while True:
        for key in list(processes):
            process = processes[key]
            if process.is_alive():
                continue
            process.join()
            item = models.VpcSyncTask.objects(id=key).first()
            item.state = 'completed'
            item.end_date = datetime.datetime.utcnow()
            item.save()
            del(processes[key])
        if not processes:
            break
        else:
            time.sleep(5)
    db.close()


if __name__ == "__main__":
    processes = {}
    while True:
        db.get_connection()
        # check if there are any tasks in the db
        tasks = models.VpcSyncTask.objects(state='queued')
        db.close()
        if tasks:
            p = Process(target=sync_batch)
            p.start()
            processes[p.pid] = p
            print('Starting batch', p.pid)
        # dict would be updated during the iteration, so make a copy of the keys for the current
        # iteration
        for pid in list(processes):
            if not processes[pid].is_alive():
                print('Completed batch', pid)
                processes[pid].join()
                del(processes[pid])
        time.sleep(5)
