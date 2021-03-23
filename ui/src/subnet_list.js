import React from 'react';
import ItemsList from 'react-antd-itemslist';
import axios from 'axios';
import { Descriptions, Space, Table, Typography } from 'antd';

export default class SubnetList extends React.Component {
    itemsListUrl = "/api/subnets"

    render() {
        return <ItemsList
            tableTitle="Subnets"
            itemsListUrl={this.itemsListUrl}
            itemBaseUrl={this.itemsListUrl}
            columns={this.getTableColumns()}
            pagination={false}
            dataKey="resource_id"
            rowActions={['deleteItem']}
            itemGetMethod={this.getSelectedItem}
            itemViewer={this.renderSelectedItem}
            history={this.props.history}
        />
    }

    getSubnetsList = (search) => {
        return axios.get('/api/subnets', {
            params: {
                vpc_id: this.props.vpc_id,
                search: search
            }
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
        return <Space size="large" direction="vertical" style={{ width: "100%" }}>
            <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label="Name">{details.name}</Descriptions.Item>
                <Descriptions.Item label="Id">{details.resource_id}</Descriptions.Item>
                <Descriptions.Item label="Region / AZ">{details.region} / {details.az}</Descriptions.Item>
                <Descriptions.Item label="Account">{details.account_id}</Descriptions.Item>
                <Descriptions.Item label="CIDR">{details.cidr}</Descriptions.Item>
                <Descriptions.Item label="Route Table">
                    {details['route_table']['name']} / {details['route_table']['resource_id']}
                </Descriptions.Item>
            </Descriptions>
            <Typography.Title level={5}>Routes</Typography.Title>
            <Table size="small" bordered pagination={false} rowSelection={false}
                columns={routeCols} rowKey="destination"
                dataSource={details.routes} />
        </Space>
    }
}