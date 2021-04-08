import React from 'react'
import axios from 'axios'
import { Card, Row, Typography, Col, Statistic, Space, Tabs, Button, message } from 'antd'
import AWSTags from './aws_tags'
import ObjectTable from './object_table'
import getIcon from './icons'
import { ReloadOutlined } from '@ant-design/icons'

export default class Dashboard extends React.Component {
    vpcId = ""
    state = {
        vpcDetails: {},
        dashboard: {},
        crawling: true,
    }

    componentDidMount() {
        this.getDashboard()
    }

    componentDidUpdate(prevProps) {
        if (this.props.location.search !== prevProps.location.search) {
            this.getDashboard()
        }
    }

    render() {
        var titleText = "All VPCs"
        if (this.state.vpcDetails.name) {
            titleText = <Space size="large">
                <span>{this.state.vpcDetails.name} / {this.state.vpcDetails.vpc_id}</span>
                <Button type="primary" icon={<ReloadOutlined />}
                    disabled={this.state.crawling}
                    onClick={this.recrawlVpc}>
                    Re-Crawl VPC Resources
                </Button>
            </Space>
        }
        return <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <Typography.Title level={4}>{titleText}</Typography.Title>
            {this.renderVpcStatCards()}
            {this.state.vpcDetails.name && this.renderVpcDetails()}
        </Space>
    }

    getDashboard = () => {
        var url = '/api/dashboard' + this.props.location.search
        axios.get(url).then(rsp => {
            this.setState({ dashboard: rsp.data })
            // if there is only 1 vpc that matches the stats, then get vpc details
            if (rsp.data.vpcs == 1) {
                axios.get('/api/vpcs' + this.props.location.search).then(rsp => {
                    this.setState({ vpcDetails: rsp.data.items[0] })
                    // save the vpc to local storage as a cache
                    this.saveVpcCache(rsp.data.items[0])
                    this.isCrawling()
                })
            } else {
                this.setState({vpcDetails: {}})
            }
        })
    }

    renderVpcStatCards = () => {
        var stats = [
            {
                title: 'Subnets',
                icon: getIcon('subnets'),
                value: this.state.dashboard.subnets,
            },
            {
                title: 'Route Tables',
                icon: getIcon('route-tables'),
                value: this.state.dashboard.route_tables,
            },
            {
                title: 'Security Groups',
                icon: getIcon('security-groups'),
                value: this.state.dashboard.security_groups,
            },
            {
                title: 'Instances',
                icon: getIcon('instances'),
                value: this.state.dashboard.instances,
            },
        ]
        if (!this.state.vpcDetails.name) {
            stats.unshift({
                title: 'VPC Regions',
                icon: getIcon('subnets'),
                value: this.state.dashboard.regions,
            })
        }
        var cardStyle = {
            border: "2px solid #cccccc",
            borderRadius: "6px",
            textAlign: "center"
        }
        var statCards = stats.map((statItem, idx) => {
            var title = <Typography.Title level={5}>{statItem.icon} {statItem.title}</Typography.Title>
            return <Col lg={6} md={8} sm={12} key={idx}>
                <Card style={{ ...cardStyle }}>
                    <Statistic value={statItem.value} title={title} />
                </Card>
            </Col>
        })

        return <>
            <Row gutter={[16, 16]}>
                {statCards}
            </Row>
        </>
    }

    renderVpcDetails = () => {
        var info = this.state.vpcDetails
        if (!info.name) {
            return null
        }
        return <Tabs>
            <Tabs.TabPane tab="VPC Details" key="vpcdetails">
                <ObjectTable data={[
                    { label: 'Name', 'value': info.name },
                    { label: 'Id', 'value': info.vpc_id },
                    { label: 'Region', 'value': info.region },
                    { label: 'CIDR', 'value': info.cidr.join(", ") },
                ]} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Tags" key="vpctags">
                <AWSTags tags={this.state.vpcDetails.tags} />
            </Tabs.TabPane>
        </Tabs>
    }

    saveVpcCache = (vpcDetails) => {
        var vpcId = vpcDetails.resource_id
        var vpcList = JSON.parse(window.localStorage.getItem('vpcs') || "[]")
        var idx = vpcList.indexOf(vpcId)
        if (idx < 0) {
            // not present in cache
            vpcList.push(vpcId)
            window.localStorage.setItem(vpcId, JSON.stringify(vpcDetails))
        } else {
            // already in cache, update the details
            window.localStorage.setItem(vpcId, JSON.stringify(vpcDetails))
        }
        // if vpcList is > 10, delete the first one
        if (vpcList.length > 10) {
            var deletedVpcId = vpcList.shift()
            window.localStorage.removeItem(deletedVpcId)
        }
        window.localStorage.setItem('vpcs', JSON.stringify(vpcList))
    }

    recrawlVpc = () => {
        var url = `/api/crawl/${this.state.vpcDetails.account_id}/${this.state.vpcDetails.region}/vpc/${this.state.vpcDetails.vpc_id}`
        axios.get(url).then(rsp => {
            message.info('Recrawl Scheduled')
            this.setState({crawling: true})
        })
    }

    isCrawling = () => {
        var url = `/api/tasks/iscrawling/${this.state.vpcDetails.account_id}/${this.state.vpcDetails.region}/${this.state.vpcDetails.vpc_id}`
        axios.get(url).then(rsp => {
            if (rsp.data.vpc_id) {
                this.setState({crawling: true})
            } else {
                this.setState({crawling: false})
            }
        })
    }
}