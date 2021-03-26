import React from 'react'
import { BorderlessTableOutlined } from '@ant-design/icons'
import { FaNetworkWired } from 'react-icons/fa'
import { MdSecurity } from 'react-icons/md'
import { GrVirtualMachine } from 'react-icons/gr'
import { GiVirtualMarker } from 'react-icons/gi'

const iconMap = {
    'subnets': <FaNetworkWired className="anticon" />,
    'route-tables': <BorderlessTableOutlined />,
    'security-groups': <MdSecurity className="anticon" />,
    'instances': <GrVirtualMachine className="anticon" />,
    'vpcs': <GiVirtualMarker className="anticon" />
}

const getIcon = (text) => {
    return iconMap[text]
}

export default getIcon