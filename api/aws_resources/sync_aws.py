from vpc import sync_vpcs
from subnet import sync_subnets
from route_table import sync_route_tables
from security_group import sync_security_groups
from instance import sync_instances
from classic_lb import sync_clbs
from elastic_lb import sync_elbs

print('Sync VPCs')
sync_vpcs()
print('Sync Subnets')
sync_subnets()
print('Sync Route Tables')
sync_route_tables()
print('Sync Security Groups')
sync_security_groups()
print('Sync Instances')
sync_instances()
print('Sync Classic LBs')
sync_clbs()
print('Sync Network LBs')
sync_elbs()
