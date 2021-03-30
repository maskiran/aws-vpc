import React from 'react'
import axios from 'axios'
import { vpcFilter } from './utils'
import { Card, Row, Typography, Col, Statistic, Space, Tabs } from 'antd'
import AWSTags from './aws_tags'
import ObjectTable from './object_table'
import getIcon from './icons'

export default class VpcDashboard extends React.Component {
    vpcId = vpcFilter(this.props.location.search, false)

    state = {
        vpcDetails: {},
        vpcStats: {},
    }

    componentDidMount() {
        this.getVpcDetails()
    }

    render() {
        var titleText = "All VPCs"
        if (this.state.vpcDetails.name) {
            titleText = "VPC - " + this.state.vpcDetails.name + " / " + this.state.vpcDetails.vpc_id
        }
        return <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <Typography.Title level={4}>{titleText}</Typography.Title>
            {this.renderVpcStatCards()}
            {this.vpcId && this.renderVpcDetails()}
        </Space>
    }

    getVpcDetails = () => {
        if (this.vpcId) {
            axios.get('/api/vpcs/' + this.vpcId).then(rsp => {
                this.setState({ vpcDetails: rsp.data })
                // save the vpc to local storage as a cache
                this.saveVpcCache(this.vpcId, rsp.data)
            })
        }
        var url = '/api/vpcdashboard'
        if (this.vpcId) {
            url += '/' + this.vpcId
        }
        axios.get(url).then(rsp => {
            this.setState({ vpcStats: rsp.data })
        })
    }

    renderVpcStatCards = () => {
        var stats = [
            {
                title: 'Subnets',
                icon: getIcon('subnets'),
                value: this.state.vpcStats.subnets,
                color: "green"
            },
            {
                title: 'Route Tables',
                icon: getIcon('route-tables'),
                value: this.state.vpcStats.route_tables,
                color: "blue"
            },
            {
                title: 'Security Groups',
                icon: getIcon('security-groups'),
                value: this.state.vpcStats.security_groups,
                color: "red"
            },
            {
                title: 'Instances',
                icon: getIcon('instances'),
                value: this.state.vpcStats.instances,
                color: "red"
            },
        ]
        if (!this.vpcId) {
            stats.unshift({
                title: 'Regions',
                icon: getIcon('subnets'),
                value: this.state.vpcStats.regions,
                color: "green"
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

    saveVpcCache = (vpcId, vpcDetails) => {
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
}