from vpc import sync_vpcs
from subnet import sync_subnets
from route_table import sync_route_tables
from security_group import sync_security_groups

sync_vpcs()
sync_subnets()
sync_route_tables()
sync_security_groups()
