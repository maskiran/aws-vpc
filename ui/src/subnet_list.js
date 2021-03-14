import React from 'react';
import ItemsList from 'react-antd-itemslist';
import axios from 'axios';
import { Descriptions, Space, Table, Typography } from 'antd';

export default class SubnetList extends React.Component {
    render() {
        return <ItemsList
            tableTitle="Subnets"
            itemsListMethod={this.getSubnetsList}
            columns={this.getTableColumns()}
            pagination={false}
            rowActions={['deleteItem']}
            itemGetMethod={this.getSelectedItem}
            itemViewer={this.renderSelectedItem}
            history={this.props.history}
        />
    }

    getSubnetsList = () => {
        return axios.get('/api/subnets', {
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
                title: 'CIDR',
                dataIndex: 'cidr'
            },
            {
                title: 'AZ',
                dataIndex: 'az'
            }
        ]
    }

    getSelectedItem = (record) => {
        return axios.get('/api/subnets/' + record.id)
    }

    renderSelectedItem = (details) => {
        var routeCols = [
            {
                title: 'Destination',
                dataIndex: 'DestinationCidrBlock'
            },
            {
                title: 'Next-Hop',
                dataIndex: 'NextHop',
                render: (hop, record) => {
                    if (record.NextHopName) {
                        return hop + ' (' + record.NextHopName + ')'
                    } else {
                        return hop
                    }
                }
            }
        ]
        return <Space size="large" direction="vertical" style={{ width: "100%" }}>
            <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label="Name">{details.name}</Descriptions.Item>
                <Descriptions.Item label="Id">{details.id}</Descriptions.Item>
                <Descriptions.Item label="CIDR">{details.cidr}</Descriptions.Item>
                <Descriptions.Item label="AZ">{details.az}</Descriptions.Item>
                <Descriptions.Item label="Route Table">
                    {details['route-table-name']} - {details['route-table-id']}
                </Descriptions.Item>
            </Descriptions>
            <Typography.Title level={5}>Routes</Typography.Title>
            <Table size="small" bordered pagination={false} rowSelection={false}
                columns={routeCols} dataKey="DestinationCidrBlock"
                dataSource={details.routes} />
        </Space>
    }
}