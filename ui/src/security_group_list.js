import React from 'react';
import ItemsList from 'react-antd-itemslist';
import { Space, Table, Tabs } from 'antd';
import { vpcFilter, Copy } from './utils'
import ObjectTable from './object_table';


export default class SecurityGroupList extends React.Component {
    filteredVpc = vpcFilter(this.props.location.search, false)
    itemsListUrl = "/api/security-groups" + vpcFilter(this.props.location.search)
    itemBaseUrl = "/api/security-groups"

    render() {
        return <ItemsList
            tableTitle="Security Groups"
            itemsListUrl={this.itemsListUrl}
            itemBaseUrl={this.itemBaseUrl}
            indexColViewLink={true}
            columns={this.getTableColumns()}
            pagination
            dataKey="resource_id"
            rowActions={[]}
            rowSelection={false}
            addButtonTitle={false}
            deleteButtonTitle={false}
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
            <ObjectTable data={[
                { label: 'Name', value: details.name },
                { label: 'Id', value: details.id },
            ]} />
            <Tabs>
                <Tabs.TabPane tab="Inbound Rules" key="inbound">
                    {this.renderRules(details.ingress_rules)}
                </Tabs.TabPane>
                <Tabs.TabPane tab="Outbound Rules" key="outbound">
                    {this.renderRules(details.egress_rules)}
                </Tabs.TabPane>
            </Tabs>
        </Space>
    }

    renderRules = (rulesList) => {
        // rules dont have any id, so add idx as a key
        rulesList.forEach((item, idx) => {
            item.id = idx
        })
        var cols = [
            {
                title: 'Protocol',
                dataIndex: 'protocol',
                render: (text) => {
                    if (text === "-1") {
                        return 'All'
                    } else {
                        return text
                    }
                }
            },
            {
                title: 'Sources',
                dataIndex: 'source'
            },
            {
                title: 'Ports',
                dataIndex: 'ignore',
                render: (text, record) => {
                    if (record.start_port >= 0 && record.end_port <= 65535) {
                        if (record.start_port !== record.end_port) {
                            return record.start_port + ' - ' + record.end_port
                        } else {
                            return record.start_port || 'All'
                        }
                    } else {
                        return text
                    }
                }
            },
        ]
        return <Table size="small" bordered pagination={false} rowSelection={false}
            columns={cols} rowKey="id"
            dataSource={rulesList} />
    }
}