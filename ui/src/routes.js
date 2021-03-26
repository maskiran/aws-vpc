import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import VpcList from './vpc_list'
import RecentVpcList from './recent_vpc_list'
import SubnetList from './subnet_list'
import RouteTableList from './route_table_list'
import SecurityGroupList from './security_group_list'
import InstanceList from './instance_list'
import VpcDashboard from './vpc_dashboard'
import LoadBalancerList from './load_balancer_list'

const Routes = (
    <Switch>
        <Route exact path="/">
            <Redirect to="/vpcs" />
        </Route>
        <Route exact path="/vpcs" component={VpcList} />
        <Route exact path="/recentvpcs" component={RecentVpcList} />
        <Route exact path="/vpcdashboard" component={VpcDashboard} />
        <Route exact path="/subnets" component={SubnetList} />
        <Route exact path="/route-tables" component={RouteTableList} />
        <Route exact path="/security-groups" component={SecurityGroupList} />
        <Route exact path="/instances" component={InstanceList} />
        <Route exact path="/load-balancers" component={LoadBalancerList} />
    </Switch>
)

export default Routes;