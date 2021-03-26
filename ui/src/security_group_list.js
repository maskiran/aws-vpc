import React from 'react';
import ItemsList from 'react-antd-itemslist';
import { Descriptions, Space, Table, Tabs, Tooltip } from 'antd';
import { vpcFilter, Copy } from './utils'

export default class SecurityGroupList extends React.Component {
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
                title: 'VPC',
                dataIndex: 'vpc_id'
            },
        ]
    }

    renderSelectedItem = (details) => {
        return <Space size="middle" direction="vertical" style={{ width: "100%" }}>
            <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label="Name"><Copy text={details.name}/></Descriptions.Item>
                <Descriptions.Item label="Id"><Copy text={details.id}/></Descriptions.Item>
            </Descriptions>
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