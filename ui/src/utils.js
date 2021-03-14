import React from 'react';
import { Tooltip, Button, Descriptions } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { CopyOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { SiAmazonaws, SiMicrosoftazure, SiGooglecloud } from 'react-icons/si';

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

export const vpcLink = (vpcId, region) => {
    var url = `https://console.aws.amazon.com/vpc/home?region=${region}#VpcDetails:VpcId=${vpcId}`
    return <CopyToClipboard text={url}><span>
        <a href={url} target="_blank" rel="noopener noreferrer">
            {vpcId}
            <HiOutlineExternalLink className="react-icon-right" />
        </a>
        <Button type="link" icon={<CopyOutlined />} />
    </span></CopyToClipboard >
}

export const subnetLink = (subnetId, region) => {
    var url = `https://console.aws.amazon.com/vpc/home?region=${region}#SubnetDetails:subnetId=${subnetId}`
    return <CopyToClipboard text={url}><span>
        <a href={url} target="_blank" rel="noopener noreferrer">
            {subnetId}
            <HiOutlineExternalLink className="react-icon-right" />
        </a>
        <Button type="link" icon={<CopyOutlined />} />
    </span></CopyToClipboard >
}

export const securityGroupLink = (sgId, region) => {
    var url = `https://console.aws.amazon.com/vpc/home?region=${region}#SecurityGroup:groupId=${sgId}`
    return <CopyToClipboard text={url}><span>
        <a href={url} target="_blank" rel="noopener noreferrer">
            {sgId}
            <HiOutlineExternalLink className="react-icon-right" />
        </a>
        <Button type="link" icon={<CopyOutlined />} />
    </span></CopyToClipboard >
}

export const iamRoleLink = (roleName, region) => {
    var url = `https://console.aws.amazon.com/iam/home?region=${region}#/roles/${roleName}`
    return <CopyToClipboard text={url}><span>
        <a href={url} target="_blank" rel="noopener noreferrer">
            {roleName}
            <HiOutlineExternalLink className="react-icon-right" />
        </a>
        <Button type="link" icon={<CopyOutlined />} />
    </span></CopyToClipboard >
}

export const instanceLink = (instanceId, region) => {
    var url = `https://console.aws.amazon.com/ec2/v2/home?region=${region}#InstanceDetails:instanceId=${instanceId}`
    return <CopyToClipboard text={url}><span>
        <a href={url} target="_blank" rel="noopener noreferrer">
            {instanceId}
            <HiOutlineExternalLink className="react-icon-right" />
        </a>
        <Button type="link" icon={<CopyOutlined />} />
    </span></CopyToClipboard >
}

export const lbLink = (lbName, region, shortName) => {
    var displayName = lbName;
    if (shortName === true) {
        var cmps = lbName.split(':');
        displayName = cmps[cmps.length - 1]
    } else if (shortName) {
        // any other string provided
        displayName = shortName;
    }
    var url = `https://console.aws.amazon.com/ec2/v2/home?region=${region}#LoadBalancers:search=${lbName};sort=loadBalancerName`
    return <CopyToClipboard text={url}><span>
        <a href={url} target="_blank" rel="noopener noreferrer">
            {displayName}
            <HiOutlineExternalLink className="react-icon-right" />
        </a>
        <Button type="link" icon={<CopyOutlined />} />
    </span></CopyToClipboard >
}

export const linkInNewTab = (url, displayName) => {
    if (!displayName) {
        displayName = url;
    }
    return <CopyToClipboard text={url}><span>
        <a href={url} target="_blank" rel="noopener noreferrer">
            {displayName}
            <HiOutlineExternalLink className="react-icon-right" />
        </a>
        <Button type="link" icon={<CopyOutlined />} />
    </span></CopyToClipboard >
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

export const renderRowAsDescription = (record, tableCols) => {
    // from antd table cols structure, render a record as a descriptions
    // table. this is for itemviewer details where there is no additional
    // data
    var items = [];
    var columns = [];
    tableCols.forEach(column => {
        if (column.children) {
            columns = columns.concat(column.children)
        } else {
            columns.push(column)
        }
    })
    columns.forEach(column => {
        var dItem = <Descriptions.Item label={column.title} key={column.title}>
            {column.render ?
                column.render(record[column.dataIndex], record)
                :
                record[column.dataIndex]}
        </Descriptions.Item>
        items.push(dItem);
    })
    return <Descriptions size="small" column={1} bordered
        className="description-label-fit">
        {items}
    </Descriptions>
}