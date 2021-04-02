import React from 'react'
import _ from 'lodash'
import { BorderlessTableOutlined, TableOutlined } from '@ant-design/icons'
import { FaNetworkWired } from 'react-icons/fa'
import { MdSecurity } from 'react-icons/md'
import { GrVirtualMachine } from 'react-icons/gr'
import { GiVirtualMarker } from 'react-icons/gi'
import {BiBookContent} from 'react-icons/bi'

const iconMap = {
    'subnets': <FaNetworkWired className="anticon" />,
    'route-tables': <BorderlessTableOutlined />,
    'security-groups': <MdSecurity className="anticon" />,
    'instances': <GrVirtualMachine className="anticon" />,
    'vpcs': <GiVirtualMarker className="anticon" />,
    'accounts': <BiBookContent className="anticon" />,
}

const getIcon = (text) => {
    return _.get(iconMap, text, <TableOutlined />)
}

export default getIcon