import React from 'react'
import _ from 'lodash'
import ItemsList from 'react-antd-itemslist'
import { Descriptions, Space, Tabs, Tooltip } from 'antd'
import AWSTags from './aws_tags'
import AWSNetworkInterfaces from './aws_network_interfaces'
import { vpcFilter, Copy } from './utils'

export default class InstanceList extends React.Component {
    itemsListUrl = "/api/instances" + vpcFilter(this.props.location.search)
    itemBaseUrl = "/api/instances"

    state = {
        activeTabKey: "network",
    }

    render() {
        return <ItemsList
            tableTitle="Instances"
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
            itemViewerWidth="60%"
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
        return <Space size="middle" direction="vertical" style={{ width: "100%" }}>
            <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label="Name / Id">
                    <Copy text={details.name} /> / <Copy text={details.resource_id} /></Descriptions.Item>
                <Descriptions.Item label="Region / AZ">
                    <Copy text={details.region} /> / <Copy text={details.az} />
                </Descriptions.Item>
                <Descriptions.Item label="Account"><Copy text={details.account_id} /></Descriptions.Item>
                <Descriptions.Item label="Instance Type"><Copy text={details.instance_type} /></Descriptions.Item>
                <Descriptions.Item label="Key Name"><Copy text={details.key_name} /></Descriptions.Item>
                <Descriptions.Item label="Launch Time / State">
                    {details.launch_time.$date} / {details.state}
                </Descriptions.Item>
            </Descriptions>
            <Tabs activeKey={this.state.activeTabKey} onChange={this.setActiveTabKey}>
                <Tabs.TabPane tab="Network Interfaces" key="network">
                    <AWSNetworkInterfaces interfaces={details.network_interfaces} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Tags" key="Tag">
                    <AWSTags tags={details.tags} />
                </Tabs.TabPane>
            </Tabs>
        </Space>
    }

    setActiveTabKey = (activeKey) => {
        this.setState({ activeTabKey: activeKey })
    }
}