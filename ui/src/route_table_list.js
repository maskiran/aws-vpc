import React from 'react'
import ItemsList from 'react-antd-itemslist'
import { Descriptions, Space, Table, Typography, Tooltip } from 'antd'
import { vpcFilter, Copy } from './utils'


export default class RouteTableList extends React.Component {
    itemsListUrl = "/api/route-tables" + vpcFilter(this.props.location.search)
    itemBaseUrl = "/api/route-tables"

    render() {
        return <ItemsList
            tableTitle="Route Tables"
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
        var routeCols = [
            {
                title: 'Destination',
                dataIndex: 'destination'
            },
            {
                title: 'Next-Hop',
                dataIndex: 'next_hop'
            }
        ]
        return <Space size="middle" direction="vertical" style={{ width: "100%" }}>
            <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label="Name"><Copy text={details.name} /></Descriptions.Item>
                <Descriptions.Item label="Id"><Copy text={details.resource_id} /></Descriptions.Item>
                <Descriptions.Item label="Region"><Copy text={details.region} /></Descriptions.Item>
                <Descriptions.Item label="Account"><Copy text={details.account_id} /></Descriptions.Item>
                <Descriptions.Item label="Subnets"><Copy text={details.subnets} /></Descriptions.Item>
            </Descriptions>
            <Typography.Title level={5}>Routes</Typography.Title>
            <Table size="small" bordered pagination={false} rowSelection={false}
                columns={routeCols} rowKey="destination"
                dataSource={details.routes} />
        </Space>
    }
}