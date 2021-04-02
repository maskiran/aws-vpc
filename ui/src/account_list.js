import React from 'react'
import ItemsList from 'react-antd-itemslist'
import Form from 'antd/lib/form'
import Input from 'antd/lib/input'
import dayjs from 'dayjs'
import {Copy} from './utils'

const AccountEditor = (props) => {
    return <Form layout="vertical" onFinish={props.onSubmit} name="editor-form">
        <Form.Item label="Account Name" name="name" tooltip="Friendly name for the account">
            <Input placeholder="Account Name" />
        </Form.Item>
        <Form.Item label="AWS Access Key" name="access_key">
            <Input placeholder="access key" />
        </Form.Item>
        <Form.Item label="AWS Secret Key" name="secret_key">
            <Input placeholder="secret key" />
        </Form.Item>
        <Form.Item label="IAM Role ARN" name="role_arn"
            tooltip="Cross account IAM Role to use instead of access/secret">
            <Input placeholder="IAM Role ARN" />
        </Form.Item>
        <Form.Item label="Regions" name="regions"
            help="Comma separated region names e.g. us-east-1,us-east-2">
            <Input placeholder="us-east-1,us-east-2,us-west-1,us-west-2" />
        </Form.Item>
    </Form>
}

export default class AccountList extends React.Component {
    itemsListUrl = "/api/accounts"

    render() {
        return <ItemsList
            tableTitle="Accounts"
            itemsListUrl={this.itemsListUrl}
            itemBaseUrl={this.itemsListUrl}
            indexColViewLink={true}
            columns={this.getTableColumns()}
            pagination
            dataKey="name"
            rowActions={['deleteItem']}
            itemViewerEditLink={false}
            history={this.props.history}
            editor={AccountEditor}
        />
    }

    getTableColumns = () => {
        return [
            {
                title: 'Name',
                dataIndex: 'name',
            },
            {
                title: 'Account',
                dataIndex: 'account_number',
            },
            {
                title: 'Regions',
                dataIndex: 'regions',
                render: (text) => {
                    return text.join(",")
                }
            },
            {
                title: 'Last Updated',
                dataIndex: 'last_updated',
                render: (text) => {
                    var t = dayjs(text)
                    return <Copy text={t.format('YYYY-MM-DD HH:mm:ss')}
                        tooltip={t.toString()} maincopy={false} tooltipcopy={false} />
                }
            },
        ]
    }
}