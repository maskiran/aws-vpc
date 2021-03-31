import React from 'react'
import { Space, Table } from 'antd'
import { Copy } from './utils'

export default class AWSNetworkInterfaces extends React.Component {
    cols = [
        {
            title: 'Id',
            dataIndex: 'resource_id',
            render: (text) => {
                return <Copy text={text} />
            }
        },
        {
            title: 'Subnet',
            dataIndex: 'subnet',
            render: (subnet) => {
                return <Copy text={subnet.name} tooltip={subnet.resource_id} trim={16} />
            }
        },
        {
            title: 'Private IP',
            dataIndex: 'private_ip',
            render: (text) => {
                return <Copy text={text} />
            }
        },
        {
            title: 'Public IP',
            dataIndex: 'public_ip',
            render: (text) => {
                if (text) {
                    return <Copy text={text} />
                } else {
                    return ""
                }
            }
        },
        {
            title: 'Src/Dst Check',
            dataIndex: 'src_dst_check',
            render: (text) => {
                if (text === true) {
                    return "true"
                } else {
                    return "false"
                }
            }
        },
        {
            title: 'Security Groups',
            dataIndex: 'security_groups',
            render: (sgList) => {
                var sgItems = sgList.map(sg => {
                    return <Copy text={sg.name} tooltip={sg.resource_id} key={sg.name} trim={16} />
                })
                return <Space direction="vertical">{sgItems}</Space>
            }
        },
    ]

    render() {
        return <Table size="small" bordered pagination={false} rowSelection={false}
            columns={this.cols} rowKey="mac"
            dataSource={this.props.interfaces} />
    }
}

