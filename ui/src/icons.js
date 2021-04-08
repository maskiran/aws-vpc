import React from 'react'
import _ from 'lodash'
import { BorderlessTableOutlined, TableOutlined } from '@ant-design/icons'
import { FaNetworkWired } from 'react-icons/fa'
import { MdSecurity } from 'react-icons/md'
import { VscVm } from 'react-icons/vsc'
import { GiVirtualMarker } from 'react-icons/gi'
import { BiBookContent } from 'react-icons/bi'
import { FaBalanceScale } from 'react-icons/fa'
import { MdAttachment } from 'react-icons/md'

const iconMap = {
    'subnets': <FaNetworkWired className="anticon" />,
    'route-tables': <BorderlessTableOutlined />,
    'security-groups': <MdSecurity className="anticon" />,
    'instances': <VscVm className="anticon" />,
    'vpcs': <GiVirtualMarker className="anticon" />,
    'accounts': <BiBookContent className="anticon" />,
    'load-balancers': <FaBalanceScale className="anticon" />,
    'tgw-attachments': <MdAttachment className="anticon" />,
}

const getIcon = (text) => {
    return _.get(iconMap, text, <TableOutlined />)
}

export default getIcon