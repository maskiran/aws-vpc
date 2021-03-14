import React from 'react';
import _ from 'lodash';
import ItemsList from 'react-antd-itemslist';
import axios from 'axios';
import { Descriptions, Space, Table, Tabs, Typography } from 'antd';

export default class InstanceList extends React.Component {
    render() {
        return <ItemsList
            tableTitle="Instances"
            itemsListMethod={this.getInstancesList}
            columns={this.getTableColumns()}
            pagination={false}
            rowActions={['deleteItem']}
            itemGetMethod={this.getSelectedItem}
            itemViewer={this.renderSelectedItem}
            history={this.props.history}
        />
    }

    getInstancesList = () => {
        return axios.get('/api/instances', {
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
                dataIndex: 'id'
            },
            {
                title: 'Launch Time',
                dataIndex: 'launch_time'
            },
            {
                title: 'Type',
                dataIndex: 'instance_type'
            },
            {
                title: 'IP Address',
                dataIndex: 'private_ip_address',
                render: (text, record) => {
                    if (record.public_ip_address) {
                        return record.public_ip_address + ' / ' + text
                    } else {
                        return text
                    }
                }
            },
            {
                title: 'KeyPair',
                dataIndex: 'key_name',
                hide: true,
            },
            {
                title: 'Role',
                dataIndex: 'role',
                render: (text) => {
                    return _.last(text.split('/'))
                },
                hide: true,
            },
        ]
    }

    getSelectedItem = (record) => {
        return axios.get('/api/instances/' + record.id)
    }

    renderSelectedItem = (details) => {
        return <Space size="large" direction="vertical" style={{ width: "100%" }}>
            <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label="Name">{details.name}</Descriptions.Item>
                <Descriptions.Item label="Id">{details.id}</Descriptions.Item>
            </Descriptions>
            <Tabs>
                <Tabs.TabPane tab="Inbound Rules" key="inbound">
                    {this.renderRules(details.inbound_rules)}
                </Tabs.TabPane>
                <Tabs.TabPane tab="Outbound Rules" key="outbound">
                    {this.renderRules(details.outbound_rules)}
                </Tabs.TabPane>
            </Tabs>
        </Space>
    }
}