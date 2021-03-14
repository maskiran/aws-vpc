import React from 'react';
import { Layout } from 'antd';
import VpcSidebar from './vpc_sidebar';
import SubnetList from './subnet_list';
import RouteTableList from './route_table_list';
import SecurityGroupList from './security_group_list';
import InstanceList from './instance_list';

export default class VpcInfo extends React.Component {
    getCategoryComponent = (category) => {
        switch (category) {
            case 'subnets':
                return <SubnetList {...this.props} vpc_id={this.props.match.params.vpc_id} />
            case 'route-tables':
                return <RouteTableList {...this.props} vpc_id={this.props.match.params.vpc_id} />
            case 'security-groups':
                return <SecurityGroupList {...this.props} vpc_id={this.props.match.params.vpc_id} />
            case 'instances':
                return <InstanceList {...this.props} vpc_id={this.props.match.params.vpc_id} />
            default:
                return category
        }
        return
    }

    render() {
        var vpcId = this.props.match.params.vpc_id;
        var category = this.props.match.params.category
        return <Layout style={{minHeight: "100%"}}>
            <Layout.Sider theme="light" collapsible width="250">
                <VpcSidebar vpc_id={vpcId} category={category} />
            </Layout.Sider>
            <Layout.Content style={{ padding: "20px" }}>
                {this.getCategoryComponent(category)}
            </Layout.Content>
        </Layout>
    }
}