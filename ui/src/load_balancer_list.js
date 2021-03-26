import React from 'react'
import _ from 'lodash'
import ItemsList from 'react-antd-itemslist'
import { Tooltip } from 'antd'
import { vpcFilter } from './utils'
import { InfoCircleOutlined } from '@ant-design/icons'

export default class LoadBalancerList extends React.Component {
    itemsListUrl = "/api/load-balancers" + vpcFilter(this.props.location.search)
    itemBaseUrl = "/api/load-balancers"

    state = {
        activeTabKey: "network",
    }

    render() {
        return <ItemsList
            tableTitle="Instances"
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
            // itemViewer={this.renderSelectedItem}
            itemViewerEditLink={false}
            // itemViewerWidth="60%"
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
                title: 'VPC',
                dataIndex: 'vpc_id'
            },
            {
                title: 'Region',
                dataIndex: 'region'
            },
            {
                title: 'Subnets',
                dataIndex: 'subnets',
                render: (subnets) => {
                    return subnets.map(item => <div key={item.name}>{item.name}</div>)
                }
            },
            {
                title: 'Type',
                dataIndex: 'type',
                render: (text, record) => {
                    return record.type + ' / ' + record.scheme
                }
            },
            {
                title: 'Listeners',
                dataIndex: 'listeners',
                render: (listeners, record) => {
                    if (listeners.length > 2) {
                        var displayText = listeners.slice(0, 2).map((item, idx) => {
                            return <div key={item.port}>
                                {item.port}/{item.protocol}
                                {idx == 1 && <InfoCircleOutlined style={{marginLeft: "5px"}} />}
                            </div>
                        })
                        var allText = listeners.map(item => <div key={item.port}>{item.port}/{item.protocol}</div>)
                        return <Tooltip title={allText}>{displayText}</Tooltip>
                    } else {
                        return listeners.map(item => <div key={item.port}>{item.port}/{item.protocol}</div>)
                    }
                }
            },
        ]
    }
}