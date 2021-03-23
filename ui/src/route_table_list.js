import React from 'react';
import ItemsList from 'react-antd-itemslist';
import axios from 'axios';
import { Descriptions, Space, Table, Typography } from 'antd';

export default class RouteTableList extends React.Component {
    itemsListUrl = "/api/route-tables"

    render() {
        return <ItemsList
            tableTitle="Route Tables"
            itemsListUrl={this.itemsListUrl}
            itemBaseUrl={this.itemsListUrl}
            columns={this.getTableColumns()}
            dataKey="resource_id"
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
        return <Space size="large" direction="vertical" style={{ width: "100%" }}>
            <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label="Name">{details.name}</Descriptions.Item>
                <Descriptions.Item label="Id">{details.resource_id}</Descriptions.Item>
                <Descriptions.Item label="Region">{details.region}</Descriptions.Item>
                <Descriptions.Item label="Subnets">{details.subnets}</Descriptions.Item>
            </Descriptions>
            <Typography.Title level={5}>Routes</Typography.Title>
            <Table size="small" bordered pagination={false} rowSelection={false}
                columns={routeCols} rowKey="destination"
                dataSource={details.routes} />
        </Space>
    }
}