import React from 'react'
import ItemsList from 'react-antd-itemslist'
import { Descriptions, Space, Table, Tooltip, Typography } from 'antd'
import { Copy, vpcFilter } from './utils'

export default class SubnetList extends React.Component {
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
                title: 'VPC ID',
                dataIndex: 'vpc_id',
            },
            {
                title: 'VPC Name',
                dataIndex: 'vpc_name',
                hide: true,
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
            <Typography.Title level={5}>Subnet Details</Typography.Title>
            <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label="Name"><Copy text={details.name} /></Descriptions.Item>
                <Descriptions.Item label="Id"><Copy text={details.resource_id} /></Descriptions.Item>
                <Descriptions.Item label="Region / AZ">
                    <Copy text={details.region} /> / <Copy text={details.az} />
                </Descriptions.Item>
                <Descriptions.Item label="Account"><Copy text={details.account_id} /></Descriptions.Item>
                <Descriptions.Item label="CIDR"><Copy text={details.cidr} /></Descriptions.Item>
                <Descriptions.Item label="Route Table">
                    <Copy text={details['route_table']['name']} /> / <Copy text={details['route_table']['resource_id']} />
                </Descriptions.Item>
            </Descriptions>
            <Typography.Title level={5}>Routes</Typography.Title>
            <Table size="small" bordered pagination={false} rowSelection={false}
                columns={routeCols} rowKey="destination"
                dataSource={details.routes} />
        </Space>
    }
}