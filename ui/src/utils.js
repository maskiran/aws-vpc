import React from 'react'
import PropTypes from 'prop-types'
import { Button, Tooltip, Typography, Spin, Space } from 'antd'
import qs from 'query-string'
import axios from 'axios'
import { ReloadOutlined } from '@ant-design/icons'

export const getResponseErrorMessage = (axiosErr) => {
    var errMsg;
    if (axiosErr.response) {
        var data = axiosErr.response.data;
        errMsg = data.error || data.message || data.statusText || data
    } else if (axiosErr.request) {
        errMsg = axiosErr.request
    } else {
        errMsg = axiosErr.message
    }
    return errMsg
}

export const vpcFilter = (urlSearch, stringify = "vpc_id") => {
    // is vpc_id=value defined in the urlSearch
    var params = qs.parse(urlSearch)
    if (!params.vpc_id) {
        return ""
    }
    if (stringify !== false) {
        return "?" + qs.stringify({ [stringify]: params.vpc_id })
    } else {
        return params.vpc_id
    }
}

/**
 * @augments {Component<Props, State>}
 */
export class Copy extends React.Component {
    static propTypes = {
        /** text to show in ellipsis if greater than maxSize */
        text: PropTypes.node,
        /** tooltip text, defaults to text */
        tooltip: PropTypes.node,
        /** true/false to make the text copyable or not, default true */
        maincopy: PropTypes.bool,
        /** true/false to make the tooltip copyable or not, default true */
        tooltipcopy: PropTypes.bool,
        /** trim the main text to show only the given count chars. This will be split
         * into first half and last half of the string, default 0 - no trim */
        trim: PropTypes.number
    }

    static defaultProps = {
        maincopy: true,
        tooltipcopy: true,
        trim: 0,
    }

    render() {
        if (!this.props.text) {
            return null
        }
        var mainCopyable = {
            text: this.props.text,
            tooltips: false
        }
        if (this.props.maincopy === false) {
            mainCopyable = false
        }
        var tooltipCopyable = {
            tooltips: false
        }
        if (this.props.tooltipcopy === false) {
            tooltipCopyable = false
        }
        var mainText = this.props.text
        var toolTipText = this.props.tooltip
        if (this.props.trim) {
            // show 2 halfs with 4 dots
            if (mainText.length > this.props.trim) {
                var lastIdx = mainText.length;
                mainText = mainText.substring(0, this.props.trim / 2) + '....' + mainText.substring(lastIdx - this.props.trim / 2, lastIdx);
                // if trimmed and no tooltip has been defined, show the untrimmed text as tooltip
                if (!toolTipText) {
                    toolTipText = this.props.text
                }
            }

        }
        var style = { color: 'inherit' }
        if (toolTipText) {
            var tooltip = <Typography.Text copyable={tooltipCopyable}>{toolTipText}</Typography.Text>
            return <Tooltip title={tooltip} color="white">
                <Typography.Text copyable={mainCopyable} style={style}>{mainText}</Typography.Text>
            </Tooltip>
        } else {
            return <Typography.Text copyable={mainCopyable} style={style}>{mainText}</Typography.Text>
        }
    }
}

export class RecrawlResource extends React.Component {
    // this.props.resource
    // this.props.type
    state = {
        crawling: false
    }
    render() {
        return <Space size="large">
            <Button type="primary" icon={<ReloadOutlined />}
                disabled={this.state.crawling}
                onClick={this.recrawl}>
                Recrawl Resource
            </Button>
            {this.state.crawling && <Spin />}
        </Space>
    }

    recrawl = () => {
        var { account_id, region, resource_id } = this.props.resource
        this.setState({ crawling: true })
        var url = `/api/crawl/${account_id}/${region}/${this.props.type}/${resource_id}`
        axios.get(url).then(rsp => {
            this.setState({ crawling: false })
        })
    }
}