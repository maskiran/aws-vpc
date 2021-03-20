import React from 'react'
import { Table, Tooltip, Typography } from 'antd'

export default class AWSNetworkInterfaces extends React.Component {
    cols = [
        {
            title: 'Subnet',
            dataIndex: 'subnet',
            render: (subnet) => {
                var subnet_id = <Typography.Text copyable>{subnet.resource_id}</Typography.Text>
                return <Tooltip title={subnet_id} color="white">{subnet.name}</Tooltip>
            }
        },
        {
            title: 'IP',
            dataIndex: 'private_ip'
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
            columns={this.cols} rowKey="mac"
            dataSource={this.props.interfaces} />
    }
}

