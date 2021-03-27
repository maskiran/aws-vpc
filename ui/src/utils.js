import React from 'react'
import PropTypes from 'prop-types'
import { Tooltip, Typography } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import qs from 'query-string'

export const getResponseErrorMessage = (axiosErr) => {
    var errMsg;
    if (axiosErr.response) {
        var data = axiosErr.response.data;
        errMsg = data.error || data.message || data.statusText
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
export class TrimField extends React.Component {
    static propTypes = {
        /** text to show in ellipsis if greater than maxSize */
        text: PropTypes.string,
        /** tooltip text, defaults to text */
        tooltip: PropTypes.string,
        /** maxSize, size of the string after which ellipsis are used */
        maxSize: PropTypes.number
    }

    static defaultProps = {
        maxSize: 15
    }

    render() {
        var cellText = this.props.text
        if (cellText.length > this.props.maxSize) {
            var lastIdx = cellText.length;
            // show first 10 and last 6 chars
            cellText = cellText.substring(0, 10) + '...' + cellText.substring(lastIdx - 6, lastIdx);
        }
        var tooltip = this.props.tooltip
        if (!tooltip) {
            tooltip = this.props.text
        }
        return <Copy text={cellText} tooltip={tooltip} maincopy={false} />
    }
}

/**
 * @augments {Component<Props, State>}
 */
export class Copy extends React.Component {
    static propTypes = {
        /** text to show in ellipsis if greater than maxSize */
        text: PropTypes.string,
        /** tooltip text, defaults to text */
        tooltip: PropTypes.string,
        /** true/false to make the text copyable or not, default true */
        maincopy: PropTypes.bool,
        /** true/false to make the tooltip copyable or not, default true */
        tooltipcopy: PropTypes.bool
    }

    static defaultProps = {
        maincopy: true,
        tooltipcopy: true
    }

    render() {
        var mainCopyable = {
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
        if (this.props.tooltip) {
            var tooltip = <Typography.Text copyable={tooltipCopyable}>{this.props.tooltip}</Typography.Text>
            return <Tooltip title={tooltip} color="white">
                <Typography.Text copyable={mainCopyable}>{this.props.text}</Typography.Text>
            </Tooltip>
        } else {
            return <Typography.Text copyable={mainCopyable}>{this.props.text}</Typography.Text>
        }
    }
}