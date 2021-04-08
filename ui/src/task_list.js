import React from 'react'
import ItemsList from 'react-antd-itemslist'
import dayjs from 'dayjs'
import {Copy} from './utils'

export default class TaksList extends React.Component {
    itemsListUrl = "/api/tasks"

    // dont want accounts to search on the "search" param, so ignore
    render() {
        return <ItemsList
            tableTitle="Tasks"
            itemsListUrl={this.itemsListUrl}
            itemBaseUrl={this.itemsListUrl}
            indexColViewLink={true}
            columns={this.getTableColumns()}
            pagination
            dataKey="id"
            rowActions={[]}
            itemViewerEditLink={false}
            history={this.props.history}
            addButtonTitle={false}
            deleteButtonTitle={false}
            searchUrlParameter='ignore'
            rowSelection={false}
            indexColViewLink={false}
        />
    }

    getTableColumns = () => {
        return [
            {
                title: 'Account',
                dataIndex: 'account_number',
            },
            {
                title: 'Region',
                dataIndex: 'region',
            },
            {
                title: 'VPC Id',
                dataIndex: 'vpc_id',
            },
            {
                title: 'VPC Name',
                dataIndex: 'vpc_name',
            },
            {
                title: 'State',
                dataIndex: 'state',
            },
            {
                title: 'Start Date',
                dataIndex: 'start_date',
                render: (text) => {
                    if (!text) {
                        return null
                    }
                    var t = dayjs(text.$date)
                    return <Copy text={t.format('YYYY-MM-DD HH:mm:ss')}
                        tooltip={t.toString()} maincopy={false} tooltipcopy={false} />
                }
            },
            {
                title: 'End Date',
                dataIndex: 'end_date',
                render: (text) => {
                    if (!text) {
                        return null
                    }
                    var t = dayjs(text.$date)
                    return <Copy text={t.format('YYYY-MM-DD HH:mm:ss')}
                        tooltip={t.toString()} maincopy={false} tooltipcopy={false} />
                }
            },
        ]
    }
}