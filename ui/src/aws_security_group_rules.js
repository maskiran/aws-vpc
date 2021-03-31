import React from 'react'
import { Table } from 'antd'

export default class AWSSecurityGroupRules extends React.Component {
    cols = [
        {
            title: 'Protocol',
            dataIndex: 'protocol',
            render: (text) => {
                if (text === "-1") {
                    return 'All'
                } else {
                    return text
                }
            }
        },
        {
            title: 'Sources',
            dataIndex: 'source'
        },
        {
            title: 'Ports',
            dataIndex: 'ignore',
            render: (text, record) => {
                if (record.start_port >= 0 && record.end_port <= 65535) {
                    if (record.start_port !== record.end_port) {
                        return record.start_port + ' - ' + record.end_port
                    } else {
                        return record.start_port || 'All'
                    }
                } else {
                    return text
                }
            }
        },
    ]

    render = () => {
        // rules dont have any id, so add idx as a key
        this.props.rulesList.forEach((item, idx) => {
            item.id = idx
        })
        return <Table size="small" bordered pagination={false} rowSelection={false}
            columns={this.cols} rowKey="id"
            dataSource={this.props.rulesList} />
    }
}