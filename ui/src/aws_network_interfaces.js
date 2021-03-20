import React from 'react'
import { Table } from 'antd'

export default class AWSNetworkInterfaces extends React.Component {
    cols = [
        {
            title: 'Subnet',
            dataIndex: 'subnet'
        },
        {
            title: 'IP',
            dataIndex: 'private_ip'
        },
        {
            title: 'Mac',
            dataIndex: 'mac'
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
                return sgList.map(sg => {
                    return sg.name
                }).join(", ")
            }
        },
    ]

    render() {
        return <Table size="small" bordered pagination={false} rowSelection={false}
            columns={this.cols} dataKey="private_ip"
            dataSource={this.props.interfaces} />
    }
}

