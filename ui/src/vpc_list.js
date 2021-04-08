import React from 'react'
import ItemsList from 'react-antd-itemslist'
import { Link } from 'react-router-dom'

export default class VpcList extends React.Component {
    itemBaseUrl = "/api/vpcs"

    getItemsListUrl = () => {
        return "/api/vpcs" + this.props.location.search
    }

    render() {
        return <ItemsList
            tableTitle="VPCs"
            itemsListUrl={this.getItemsListUrl()}
            itemBaseUrl={this.itemBaseUrl}
            indexColViewLink={true}
            columns={this.getTableColumns()}
            pagination
            dataKey="resource_id"
            rowActions={[]}
            rowSelection={false}
            addButtonTitle={false}
            deleteButtonTitle={false}
            searchSpan={0}
            itemViewerEditLink={false}
            history={this.props.history}
        />
    }

    getTableColumns = () => {
        return [
            {
                title: 'Name',
                dataIndex: 'name',
                render: (name, record) => {
                    var url = `/dashboard?vpc_id=${record.resource_id}&account_id=${record.account_id}&region=${record.region}`
                    return <Link to={url}>{name}</Link>
                }
            },
            {
                title: 'Id',
                dataIndex: 'resource_id'
            },
            {
                title: 'Account',
                dataIndex: 'account_id'
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