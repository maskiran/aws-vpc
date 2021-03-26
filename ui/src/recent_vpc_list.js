import React from 'react'
import ItemsList from 'react-antd-itemslist'
import { Link } from 'react-router-dom'

export default class RecentVpcList extends React.Component {
    itemsListUrl = "/api/vpcs"

    render() {
        return <ItemsList
            tableTitle="Recent VPCs"
            itemsListMethod={this.getRecentVpcs}
            itemBaseUrl={this.itemsListUrl}
            indexColViewLink={true}
            columns={this.getTableColumns()}
            pagination
            dataKey="resource_id"
            rowActions={[]}
            rowSelection={false}
            addButtonTitle={false}
            deleteButtonTitle={false}
            // itemViewer={this.renderSelectedItem}
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
                    return <Link to={"/vpcdashboard?vpc_id=" + record.resource_id}>{name}</Link>
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

    getRecentVpcs = () => {
        var data = []
        JSON.parse(window.localStorage.getItem('vpcs')).forEach(vpcId => {
            data.push(JSON.parse(window.localStorage.getItem(vpcId)))
        })
        return new Promise((resolve, reject) => {
            resolve({ data: data })
        })
    }
}