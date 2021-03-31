import React from 'react'
import _ from 'lodash'
import ItemsList from 'react-antd-itemslist'
import { Space, Table, Tabs, Tooltip } from 'antd'
import { vpcFilter, Copy } from './utils'
import ObjectTable from './object_table'
import AWSTags from './aws_tags'

export default class LoadBalancerList extends React.Component {
    filteredVpc = vpcFilter(this.props.location.search, false)
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
                title: 'Account',
                dataIndex: 'account_id'
            },
            {
                title: 'Region',
                dataIndex: 'region'
            },
            {
                title: 'Type',
                dataIndex: 'type',
                render: (text, record) => {
                    return record.type + ' / ' + record.scheme
                }
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
                title: 'Subnets',
                dataIndex: 'subnets',
                render: (subnets) => {
                    return subnets.map(item => <div key={item.name}><Copy text={item.name} trim={16} maincopy={false} /></div>)
                }
            },
            {
                title: 'Listeners',
                dataIndex: 'listeners',
                render: (listeners, record) => {
                    if (listeners.length > 2) {
                        var displayText = listeners.slice(0, 2).map(item => {
                            return <div key={item.port}>{item.port}/{item.protocol}</div>
                        })
                        displayText.push(<div key="more">{listeners.length - 2} more..</div>)
                        var allText = listeners.map(item => <div key={item.port}>{item.port}/{item.protocol}</div>)
                        return <Tooltip title={allText}>{displayText}</Tooltip>
                    } else {
                        return listeners.map(item => <div key={item.port}>{item.port}/{item.protocol}</div>)
                    }
                }
            },
        ]
    }

    renderSelectedItem = (details) => {
        return <Space size="middle" direction="vertical" style={{ width: "100%" }}>
            <ObjectTable data={[
                { label: 'Name', value: details['name'] },
                { label: 'ARN', value: details['arn'] },
                { label: 'DNS', value: details['dns'] },
                { label: 'VPC', value: [details['vpc_name'], details['vpc_id']] },
                { label: 'Region', value: details['region'] },
                { label: 'Account', value: details['account_id'] },
                { label: 'Type', value: details['type'], copyable: false },
                { label: 'Scheme', value: details['scheme'], copyable: false },
                { label: 'Subnets', value: this.renderSubnets(details) },
                { label: 'Security Groups', value: this.renderSecurityGroups(details) },
            ]} />
            <Tabs>
                <Tabs.TabPane tab="Listeners" key='listeners'>
                    {this.renderListeners(details)}
                </Tabs.TabPane>
                <Tabs.TabPane tab="Security Groups" key='sgrules'
                    disabled={!details.security_groups}>
                    {this.renderSecurityGroupRules(details)}
                </Tabs.TabPane>
                <Tabs.TabPane tab="Tags" key='tags'>
                    <AWSTags tags={details.tags} />
                </Tabs.TabPane>
            </Tabs>
        </Space>
    }

    renderSubnets = (details) => {
        var subnets = details.subnets.map(subnet => {
            return <Space key={subnet.resource_id}>
                <Copy text={subnet.name} />
                /
                <Copy text={subnet.resource_id} />
            </Space>
        })
        return <Space direction="vertical">{subnets}</Space>
    }

    renderSecurityGroups = (details) => {
        if (!details.security_groups) {
            return 'No Security Groups'
        }
        var sgs = details.security_groups.map(sg => {
            return <Space key={sg.resource_id}>
                <Copy text={sg.name} />
                /
                <Copy text={sg.resource_id} />
            </Space>
        })
        return <Space direction="vertical">{sgs}</Space>
    }

    renderSecurityGroupRules = (details) => {
        if (!details.security_groups) {
            return 'No Security Groups'
        }
        var rulesList = []
        var idx = 0
        details.security_groups.forEach(sg => {
            // add sg name and the id to each of the rules
            sg.ingress_rules.forEach(rule => {
                idx++
                rule.sg_info = {
                    name: sg.name,
                    resource_id: sg.resource_id
                }
                rule.id = idx
                rulesList.push(rule)
            })
        })
        var cols = [
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
            {
                title: 'Security Group',
                dataIndex: 'sg_name',
                render: (sg, record) => {
                    return record.sg_info.name
                }
            },
        ]
        return <Table size="small" bordered pagination={false} rowSelection={false}
            columns={cols} rowKey="id"
            dataSource={rulesList} />
    }

    renderListeners = (details) => {
        // expand the listener's instances into its own rows and then use
        // rowspan on the common fields
        // col1, col2, [col3-row1, col3-row2] is expanded as
        // [col1, col2, col3-row1]
        // [ '', '', col3-row2]
        // with col1 and col2 set to rowspan=2 in the first row and rowspan=0 for the rest of the rows
        var listeners = []
        details.listeners.forEach((item, idx) => {
            item.id = idx
            listeners.push(item)
            item.instance_count = item.instances.length
            if (item.instance_count === 0) {
                return
            }
            // add the first instace to the first record
            item.instance_id = item.instances[0].resource_id
            item.instance_name = item.instances[0].name
            item.target_port = item.instances[0].target_port
            item.target_protocol = item.instances[0].target_protocol
            item.instances.slice(1).forEach((inst, instIdx) => {
                listeners.push({
                    id: idx + '-' + instIdx,
                    target_port: inst.target_port,
                    target_protocol: inst.target_protocol,
                    instance_id: inst.resource_id,
                    instance_name: inst.name
                })
            })
        })
        var listenerCols = [
            {
                title: 'Listener',
                children: [
                    {
                        title: 'Port',
                        dataIndex: 'port',
                        render: (text, record) => {
                            var obj = {
                                children: <Copy text={text} tooltip={record.target_group_arn} />,
                                props: {
                                    rowSpan: record.instance_count || 1
                                }
                            }
                            if (typeof text === "undefined") {
                                // this is a spanned row, no need to display this field
                                obj.props.rowSpan = 0
                            }
                            return obj
                        }
                    },
                    {
                        title: 'Protocol',
                        dataIndex: 'protocol',
                        render: (text, record, idx) => {
                            var obj = {
                                children: text,
                                props: {
                                    rowSpan: record.instance_count || 1
                                }
                            }
                            if (typeof text === "undefined") {
                                // this is a spanned row
                                obj.props.rowSpan = 0
                            }
                            return obj
                        }
                    },
                ]
            },
            {
                title: 'Target',
                children: [
                    {
                        title: 'Instance',
                        dataIndex: 'instance_id'
                    },
                    {
                        title: 'Name',
                        dataIndex: 'instance_name'
                    },
                    {
                        title: 'Port',
                        dataIndex: 'target_port'
                    },
                    {
                        title: 'Protocol',
                        dataIndex: 'target_protocol'
                    },
                ]
            }
        ]
        return <Table rowKey="id" pagination={false} rowSelection={false}
            bordered size="small"
            columns={listenerCols}
            dataSource={listeners} />
    }
}