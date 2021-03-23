import React from 'react';
import _ from 'lodash';
import ItemsList from 'react-antd-itemslist';
import axios from 'axios';
import { Descriptions, Space, Table, Tabs, Typography } from 'antd';
import AWSTags from './aws_tags';
import AWSNetworkInterfaces from './aws_network_interfaces';

export default class InstanceList extends React.Component {
    itemsListUrl = "/api/instances"

    render() {
        return <ItemsList
            tableTitle="Instances"
            itemsListUrl={this.itemsListUrl}
            itemBaseUrl={this.itemsListUrl}
            dataKey="resource_id"
            itemViewerWidth="60%"
            columns={this.getTableColumns()}
            pagination={false}
            rowActions={['deleteItem']}
            itemViewer={this.renderSelectedItem}
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
                title: 'Launch Time',
                dataIndex: 'launch_time',
                render: (text) => {
                    return text.$date
                }
            },
            {
                title: 'Type',
                dataIndex: 'instance_type'
            },
            {
                title: 'AZ',
                dataIndex: 'az'
            },
            {
                title: 'State',
                dataIndex: 'state'
            },
            {
                title: 'IP Address',
                dataIndex: 'network_interfaces',
                render: (intfList) => {
                    return intfList.map((intf, idx) => {
                        return <div key={idx}>{intf.private_ip + ' / ' + intf.public_ip}</div>
                    })
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

    renderSelectedItem = (details) => {
        return <Space size="large" direction="vertical" style={{ width: "100%" }}>
            <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label="Name / Id">{details.name} / {details.resource_id}</Descriptions.Item>
                <Descriptions.Item label="Region / AZ">{details.region} / {details.az}</Descriptions.Item>
                <Descriptions.Item label="Account">{details.account_id}</Descriptions.Item>
                <Descriptions.Item label="Instance Type">{details.instance_type}</Descriptions.Item>
                <Descriptions.Item label="Key Name">{details.key_name}</Descriptions.Item>
                <Descriptions.Item label="Launch Time / State">{details.launch_time.$date} / {details.state}</Descriptions.Item>
            </Descriptions>
            <Tabs>
                <Tabs.TabPane tab="Network Interfaces" key="network">
                    <AWSNetworkInterfaces interfaces={details.network_interfaces} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Tags" key="Tag">
                    <AWSTags tags={details.tags} />
                </Tabs.TabPane>
            </Tabs>
        </Space>
    }
}