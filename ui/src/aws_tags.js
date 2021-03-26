import React from 'react'
import { Table } from 'antd'
import { Copy } from './utils'

export default class AWSTags extends React.Component {
    cols = [
        {
            title: 'Tag',
            dataIndex: 'key'
        },
        {
            title: 'Value',
            dataIndex: 'value',
            render: (text) => {
                return <Copy text={text} />
            }
        }
    ]

    render() {
        return <Table size="small" bordered pagination={false} rowSelection={false}
            rowClassName="aws-tags"
            columns={this.cols} rowKey="key"
            dataSource={this.props.tags} />
    }
}