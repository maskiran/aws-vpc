import React from 'react'
import _ from 'lodash'
import ItemsList from 'react-antd-itemslist'
import { Space, Tabs } from 'antd'
import AWSTags from './aws_tags'
import AWSNetworkInterfaces from './aws_network_interfaces'
import { Copy, RecrawlResource } from './utils'
import ObjectTable from './object_table'
import AWSSecurityGroupRules from './aws_security_group_rules'
import dayjs from 'dayjs'

export default class InstanceList extends React.Component {
    itemBaseUrl = "/api/instances"

    getItemsListUrl = () => {
        return "/api/instances" + this.props.location.search
    }

    state = {
        activeTabKey: "network",
        sgRules: [],
        crawling: false,
    }

    render() {
        return <ItemsList
            tableTitle="Instances"
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
            itemViewerWidth="60%"
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
                title: 'AZ',
                dataIndex: 'az',
                className: 'td-fit',
            },
            {
                title: 'Launch Time',
                dataIndex: 'launch_time',
                render: (text) => {
                    var t = dayjs(text.$date)
                    return <Copy text={t.format('YYYY-MM-DD HH:mm')}
                        tooltip={t.toString()} maincopy={false} tooltipcopy={false} />
                }
            },
            {
                title: 'Type',
                dataIndex: 'instance_type'
            },
            {
                title: 'State',
                dataIndex: 'state'
            },
            {
                title: 'IP Address',
                dataIndex: 'network_interfaces',
                render: (intfList) => {
                    return intfList.map((intf, idx) => {
                        return <div key={idx}>{intf.private_ip + ' / ' + intf.public_ip}</div>
                    })
                }
            },
            {
                title: 'KeyPair',
                dataIndex: 'key_name',
                hide: true,
            },
            {
                title: 'IAM Role',
                dataIndex: 'iam_role_name',
                render: (text) => {
                    return <Copy text={text} trim={20} maincopy={false} />
                }
            },
        ]
    }

    renderSelectedItem = (details) => {
        return <Space size="middle" direction="vertical" style={{ width: "100%" }}>
            <RecrawlResource resource={details} type="instance" />
            <ObjectTable data={[
                { label: 'Name / Id', value: [details.name, details.resource_id] },
                { label: 'Account / Region / AZ', value: [details.account_id, details.region, details.az] },
                { label: 'Instance Type', value: details.instance_type },
                { label: 'Key Name', value: details.key_name },
                { label: 'Launch Time', value: new Date(details.launch_time.$date).toISOString() },
                { label: 'State', value: details.state },
                {
                    label: 'Instance Profile / IAM Role',
                    copyable: false,
                    value: [
                        <Copy text={details.iam_instance_profile_name} tooltip={details.iam_instance_profile_arn} trim={32} />,
                        <Copy text={details.iam_role_name} tooltip={details.iam_role_arn} trim={32} />
                    ]
                },
            ]} />
            <Tabs activeKey={this.state.activeTabKey} onChange={this.setActiveTabKey}>
                <Tabs.TabPane tab="Network Interfaces" key="network">
                    <AWSNetworkInterfaces interfaces={details.network_interfaces} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Tags" key="tags">
                    <AWSTags tags={details.tags} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Security Groups" key="sgs">
                    {this.renderSecurityGroups(details)}
                </Tabs.TabPane>
            </Tabs>
        </Space>
    }

    setActiveTabKey = (activeKey) => {
        this.setState({ activeTabKey: activeKey })
    }

    renderSecurityGroups = (details) => {
        var rules = []
        details.network_interfaces.forEach(intf => {
            intf.security_groups.forEach(sg => {
                var node = <Space direction="vertical" style={{ width: "100%" }} size="middle" key={intf.resource_id + sg.resource_id}>
                    <span>{intf.resource_id} / {intf.subnet.name} / {intf.private_ip} / {sg.name}</span>
                    <AWSSecurityGroupRules rulesList={sg.ingress_rules} />
                </Space>
                rules.push(node)
            })
        })
        return <Space direction="vertical" style={{ width: "100%" }} size="middle">{rules}</Space>
    }
}