import React from 'react'
import ItemsList from 'react-antd-itemslist'
import { Space, Tabs } from 'antd'
import { Copy, RecrawlResource } from './utils'
import ObjectTable from './object_table'
import AWSSecurityGroupRules from './aws_security_group_rules'


export default class SecurityGroupList extends React.Component {
    itemBaseUrl = "/api/security-groups"

    getItemsListUrl = () => {
        return "/api/security-groups" + this.props.location.search
    }

    render() {
        return <ItemsList
            tableTitle="Security Groups"
            itemsListUrl={this.getItemsListUrl()}
            itemBaseUrl={this.itemBaseUrl}
            indexColViewLink={true}
            columns={this.getTableColumns()}
            pagination
            dataKey="resource_id"
            rowActions={[]}
            rowSelection={false}
            addButtonTitle={false}
            deleteButtonTitle={false}
            searchSpan={0}
            itemViewer={this.renderSelectedItem}
            itemViewerEditLink={false}
            history={this.props.history}
        />
    }

    getTableColumns = () => {
        return [
            {
                title: 'Name',
                dataIndex: 'name',
                viewItemLink: true,
            },
            {
                title: 'Id',
                dataIndex: 'resource_id'
            },
            {
                title: 'Account',
                dataIndex: 'account_id'
            },
            {
                title: 'Region',
                dataIndex: 'region',
            },
            {
                title: 'VPC Id',
                dataIndex: 'vpc_id',
                hide: true,
            },
            {
                title: 'VPC Name',
                dataIndex: 'vpc_name',
                render: (text, record) => {
                    return <Copy text={text} tooltip={record.vpc_id} maincopy={false} />
                }
            },
        ]
    }

    renderSelectedItem = (details) => {
        return <Space size="middle" direction="vertical" style={{ width: "100%" }}>
            <RecrawlResource resource={details} type='security-group' />
            <ObjectTable data={[
                { label: 'Name', value: details.name },
                { label: 'Id', value: details.resource_id },
            ]} />
            <Tabs>
                <Tabs.TabPane tab="Inbound Rules" key="inbound">
                    <AWSSecurityGroupRules rulesList={details.ingress_rules} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Outbound Rules" key="outbound">
                    <AWSSecurityGroupRules rulesList={details.egress_rules} />
                </Tabs.TabPane>
            </Tabs>
        </Space>
    }
}