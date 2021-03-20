import React from 'react';
import ItemsList from 'react-antd-itemslist';
import axios from 'axios';
import { Descriptions, Space, Table, Tabs, Typography } from 'antd';

export default class SecurityGroupList extends React.Component {
    render() {
        return <ItemsList
            tableTitle="Security Groups"
            itemsListMethod={this.getRouteTablesList}
            columns={this.getTableColumns()}
            pagination={false}
            rowActions={['deleteItem']}
            itemGetMethod={this.getSelectedItem}
            itemViewer={this.renderSelectedItem}
            history={this.props.history}
        />
    }

    getRouteTablesList = () => {
        return axios.get('/api/security-groups', {
            params: { vpc_id: this.props.vpc_id }
        })
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
        ]
    }

    getSelectedItem = (record) => {
        return axios.get('/api/security-groups/' + record.resource_id)
    }

    renderSelectedItem = (details) => {
        return <Space size="large" direction="vertical" style={{ width: "100%" }}>
            <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label="Name">{details.name}</Descriptions.Item>
                <Descriptions.Item label="Id">{details.id}</Descriptions.Item>
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
            columns={cols} dataKey="id"
            dataSource={rulesList} />
    }

}