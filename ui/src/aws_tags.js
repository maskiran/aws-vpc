import React from 'react'
import { Table } from 'antd'
import './aws_tags.css'

export default class AWSTags extends React.Component {
    cols = [
        {
            title: 'Tag',
            dataIndex: 'key'
        },
        {
            title: 'Value',
            dataIndex: 'value'
        }
    ]

    render() {
        return <Table size="small" bordered pagination={false} rowSelection={false}
            rowClassName="aws-tags"
            columns={this.cols} dataKey="key"
            dataSource={this.props.tags} />
    }
}