import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import VpcsList from './vpcs_list';
import VpcInfo from './vpc_info';

const Routes = (
    <Switch>
        <Route exact path="/">
            <Redirect to="/vpcs" />
        </Route>
        <Route exact path="/vpcs" component={VpcsList} />
        <Route exact path="/vpcs/:vpc_id/" component={VpcInfo} />
        <Route exact path="/vpcs/:vpc_id/:category" component={VpcInfo} />
        <Route exact path="/vpcs/:vpc_id/:category/:category_id" component={VpcInfo} />
    </Switch>
)

export default Routes;