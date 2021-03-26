import React from 'react'
import { Tooltip, Button, Typography } from 'antd'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { CopyOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { HiOutlineExternalLink } from 'react-icons/hi'
import qs from 'query-string'

export const trimField = (text, options) => {
    if (!text) return null;
    var { maxSize = 15, tooltipText = text, isTextString = true } = { ...options };
    // isTextString: true/false. (default) true assumes text is a string
    var cellText = text;
    if (isTextString && (text.length > maxSize)) {
        var lastIdx = text.length;
        // show first 10 and last 6 chars
        cellText = text.substring(0, 10) + '...' + text.substring(lastIdx - 6, lastIdx);
    }
    const tmpTooltip = <CopyToClipboard text={tooltipText}>
        <span>{tooltipText} <Button type="link" icon={<CopyOutlined />} /></span>
    </CopyToClipboard>
    if (isTextString && (tooltipText !== text)) {
        cellText = <span>{cellText} <InfoCircleOutlined /> </span>
    }

    return (
        <Tooltip title={tmpTooltip}>
            <span>{cellText}</span>
        </Tooltip>
    )
}

export const linkInNewTab = (url, displayName) => {
    if (!displayName) {
        displayName = url;
    }
    return <CopyToClipboard text={url}>
        <span>
            <a href={url} target="_blank" rel="noopener noreferrer">
                {displayName}
                <HiOutlineExternalLink className="react-icon-right" />
            </a>
            <Button type="link" icon={<CopyOutlined />} />
        </span>
    </CopyToClipboard >
}

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

export const Copy = (props) => {
    /* 
    props:
    text => text to show and copy
    tooltip => tooltip to show and copy
    maincopy={false} => dont show copy for the main text
    tooltipcopy={false} => dont show copy for the tooltip text
    */
    var mainCopyable = {
        text: props.text,
        tooltips: false
    }
    if (props.maincopy === false) {
        mainCopyable = false
    }
    var tooltipCopyable = {
        text: props.tooltip,
        tooltips: false
    }
    if (props.tooltipcopy === false) {
        tooltipCopyable = false
    }
    if (props.tooltip) {
        var title = <Typography.Text copyable={tooltipCopyable}>{props.tooltip}</Typography.Text>
        return <Tooltip title={title} color="white">
            <Typography.Text copyable={mainCopyable}>{props.text}</Typography.Text>
        </Tooltip>
    } else {
        return <Typography.Text copyable={mainCopyable}>{props.text}</Typography.Text>
    }
}