import React from 'react'
import ItemsList from 'react-antd-itemslist'
import { Space, Table, Typography } from 'antd'
import { vpcFilter, Copy } from './utils'
import ObjectTable from './object_table'

export default class SubnetList extends React.Component {
    filteredVpc = vpcFilter(this.props.location.search, false)
    itemsListUrl = "/api/subnets" + vpcFilter(this.props.location.search)
    itemBaseUrl = "/api/subnets"

    render() {
        return <ItemsList
            tableTitle="Subnets"
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
                dataIndex: 'resource_id',
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
            {
                title: 'CIDR',
                dataIndex: 'cidr'
            },
            {
                title: 'AZ',
                dataIndex: 'az'
            }
        ]
    }

    renderSelectedItem = (details) => {
        var routeCols = [
            {
                title: 'Destination',
                dataIndex: 'destination'
            },
            {
                title: 'Next-Hop',
                dataIndex: 'next_hop',
            }
        ]
        return <Space size="middle" direction="vertical" style={{ width: "100%" }}>
            <ObjectTable data={[
                { label: 'Name', value: details.name },
                { label: 'Id', value: details.resource_id },
                { label: 'Region / AZ', value: [details.region, details.az] },
                { label: 'CIDR', value: details.cidr },
                { label: 'Route Table', value: [details.route_table.name, details.route_table.resource_id] },
            ]} />
            <Typography.Title level={5}>Routes</Typography.Title>
            <Table size="small" bordered pagination={false} rowSelection={false}
                columns={routeCols} rowKey="destination"
                dataSource={details.routes} />
        </Space>
    }
}