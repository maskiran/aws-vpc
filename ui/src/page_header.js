import React from 'react'
import { ReloadOutlined } from '@ant-design/icons'
import { Button, Menu, notification, Spin } from 'antd'
import axios from 'axios'
import { vpcFilter, getResponseErrorMessage } from './utils'

export default class PageHeader extends React.Component {
    state = {
        vpcDetails: {},
        crawling: false,
        vpcId: vpcFilter(this.props.location.search, false),
    }

    componentDidMount() {
        this.getVpcDetails()
    }

    componentDidUpdate(prevProps) {
        var newVpcId = vpcFilter(this.props.location.search, false)
        var oldVpcId = vpcFilter(prevProps.location.search, false)
        if (oldVpcId != newVpcId) {
            this.setState({ vpcId: newVpcId })
            this.getVpcDetails(newVpcId)
        }
    }

    render() {
        if (this.state.vpcId) {
            return <Menu mode="horizontal" theme="dark">
                <span style={{ float: "right" }}>
                    <Button type="primary" icon={<ReloadOutlined />}
                        disabled={this.state.crawling}
                        onClick={this.recrawlVpc}>
                        Re-Crawl VPC Resources
                        {this.state.crawling && <Spin style={{ marginLeft: "16px" }} />}
                    </Button>
                </span>
            </Menu >
        } else {
            return null
        }
    }

    getVpcDetails = (vpcId) => {
        if (typeof vpcId === "undefined") {
            vpcId = this.state.vpcId
        }
        if (vpcId) {
            axios.get('/api/vpcs/' + vpcId).then(rsp => {
                this.setState({ vpcDetails: rsp.data })
            })
        }
    }

    recrawlVpc = () => {
        var url = '/api/crawl/' + this.state.vpcDetails.region + '/' + this.state.vpcDetails.vpc_id
        this.setState({ crawling: true })
        axios.get(url).then(rsp => {
        }).catch(err => {
            var msg = getResponseErrorMessage(err)
            notification.error({ duration: 0, message: msg })
        }).finally((rsp) => {
            this.setState({ crawling: false })
        })
    }
}