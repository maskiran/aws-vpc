import React from 'react';
import { Layout } from 'antd';
import ItemsList from 'react-antd-itemslist';
import { Link } from 'react-router-dom';

export default class VpcsList extends React.Component {
    state = {
        vpcsList: []
    }

    render() {
        return <Layout>
            {/* <Layout.Sider theme="light"></Layout.Sider> */}
            <Layout.Content style={{padding: "20px"}}>
                <ItemsList
                    tableTitle="VPCs"
                    itemsListUrl="/api/vpcs"
                    columns={this.getTableColumns()}
                    pagination
                    rowActions={['deleteItem']}
                    history={this.props.history}
                />
            </Layout.Content>
        </Layout>
    }

    getTableColumns = () => {
        return [
            {
                title: 'Name',
                dataIndex: 'name',
                render: (name, record) => {
                    return <Link to={"/vpcs/" + record.id}>{name}</Link> 
                }
            },
            {
                title: 'Id',
                dataIndex: 'resource_id'
            },
            {
                title: 'Region',
                dataIndex: 'region'
            },
            {
                title: 'CIDR',
                dataIndex: 'cidr',
                render: (cidr) => {
                    return cidr.join(', ')
                }
            }
        ]
    }
}