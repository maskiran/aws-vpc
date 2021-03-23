import React from 'react';
import ItemsList from 'react-antd-itemslist';
import { Link } from 'react-router-dom';

export default class VpcList extends React.Component {
    state = {
        vpcsList: []
    }

    render() {
        return <ItemsList
            tableTitle="VPCs"
            itemsListUrl="/api/vpcs"
            columns={this.getTableColumns()}
            pagination
            rowActions={['deleteItem']}
            history={this.props.history}
        />
    }

    getTableColumns = () => {
        return [
            {
                title: 'Name',
                dataIndex: 'name',
                render: (name, record) => {
                    return <Link to={"/vpcs/" + record.resource_id}>{name}</Link>
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