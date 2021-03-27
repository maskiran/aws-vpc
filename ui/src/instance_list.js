import React from 'react'
import _ from 'lodash'
import ItemsList from 'react-antd-itemslist'
import { Space, Tabs } from 'antd'
import AWSTags from './aws_tags'
import AWSNetworkInterfaces from './aws_network_interfaces'
import { vpcFilter, Copy } from './utils'
import ObjectTable from './object_table'

export default class InstanceList extends React.Component {
    filteredVpc = vpcFilter(this.props.location.search, false)
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
                dataIndex: 'vpc_id',
                hide: this.filteredVpc ? true : false,
            },
            {
                title: 'VPC Name',
                dataIndex: 'vpc_name',
                hide: this.filteredVpc ? true : false,
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
                title: 'IAM Role',
                dataIndex: 'iam_role_name',
            },
        ]
    }

    renderSelectedItem = (details) => {
        return <Space size="middle" direction="vertical" style={{ width: "100%" }}>
            <ObjectTable data={[
                { label: 'Name / Id', value: [details.name, details.resource_id] },
                { label: 'Region / AZ', value: [details.region, details.az] },
                { label: 'Instance Type', value: details.instance_type },
                { label: 'Key Name', value: details.key_name },
                { label: 'Launch Time', value: details.launch_time.$date },
                { label: 'State', value: details.state },
                {
                    label: 'Instance Profile / IAM Role',
                    copyable: false,
                    value: [
                        <Copy text={details.iam_instance_profile_name} tooltip={details.iam_instance_profile_arn} />,
                        <Copy text={details.iam_role_name} tooltip={details.iam_role_arn} />
                    ]
                },
            ]} />
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