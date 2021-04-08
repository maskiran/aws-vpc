import React from 'react'
import ItemsList from 'react-antd-itemslist'
import { Space, Table, Tabs } from 'antd'
import { Copy, RecrawlResource } from './utils'
import ObjectTable from './object_table'

export default class TgwAttachmentList extends React.Component {
    itemBaseUrl = "/api/tgw-attachments"

    getItemsListUrl = () => {
        return "/api/tgw-attachments" + this.props.location.search
    }

    render() {
        return <ItemsList
            tableTitle="Transit Gateway Attachments"
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
                dataIndex: 'resource_id'
            },
            {
                title: 'Account',
                dataIndex: 'account_id'
            },
            {
                title: 'Region',
                dataIndex: 'region',
            },
            {
                title: 'VPC Id',
                dataIndex: 'vpc_id',
                hide: true,
            },
            {
                title: 'VPC Name',
                dataIndex: 'vpc_name',
                render: (text, record) => {
                    return <Copy text={text} tooltip={record.vpc_id} maincopy={false} />
                }
            },
            {
                title: 'Route Table',
                dataIndex: 'route_table_id',
            },
        ]
    }

    renderSelectedItem = (details) => {
        var tgwRouteCols = [
            {
                title: 'Destination',
                dataIndex: 'destination'
            },
            {
                title: 'Next-Hop',
                dataIndex: 'vpc_name',
            },
            {
                title: 'Via Attachment Id',
                dataIndex: 'tgw_attachment_id',
            },
        ]
        var vpcRouteCols = [
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
            <RecrawlResource resource={details} type='tgw-attachment' />
            <ObjectTable data={[
                { label: 'Name', value: details.name },
                { label: 'Id', value: details.resource_id },
                { label: 'Region', value: [details.region] },
                { label: 'Attched VPC', value: [details.vpc_name, details.vpc_id] },
                { label: 'TGW Route Table', value: details.route_table_id },
            ]} />
            <Tabs>
                <Tabs.TabPane tab="TGW Side Routes" key="tgwroutes">
                    <Table size="small" bordered pagination={false} rowSelection={false}
                        columns={tgwRouteCols} rowKey="destination"
                        dataSource={details.tgw_routes} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="VPC Side Routes" key="vpcroutes">
                    <Tabs>
                        {Object.keys(details.vpc_routes).map(subnet => {
                            return <Tabs.TabPane tab={"Subnet " + subnet} key={subnet}>
                                <Table size="small" bordered pagination={false} rowSelection={false}
                                    columns={vpcRouteCols} rowKey="destination"
                                    dataSource={details.vpc_routes[subnet]} />
                            </Tabs.TabPane>
                        })}
                    </Tabs>
                </Tabs.TabPane>
            </Tabs>
        </Space>
    }
}