import React from 'react'
import { Menu } from 'antd'
import { Link } from 'react-router-dom'
import { DashboardOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { vpcFilter } from './utils'
import axios from 'axios'
import getIcon from './icons'


export default class AppSidebar extends React.Component {
    state = {
        vpcStats: {}
    }

    componentDidMount() {
        this.getVpcStats()
    }

    componentDidUpdate(prevProps) {
        if (this.props.location.search !== prevProps.location.search) {
            this.getVpcStats()
        }
    }

    render() {
        var sidebarKey = this.props.location.pathname
        var vpcId = vpcFilter(this.props.location.search, false)
        var vpcSearch = vpcFilter(this.props.location.search)
        var vpcText = "All VPCs"
        if (vpcId) {
            vpcText = <>
                {vpcId}
                <Link to="/vpcs"><CloseCircleOutlined style={{ marginLeft: "10px" }} /></Link>
            </>
        }
        vpcText = <span style={{ fontSize: "0.9em" }}>{vpcText}</span>
        return (
            <Menu mode="inline" theme="light" selectedKeys={[sidebarKey]} style={{ minHeight: "100%" }}>
                <Menu.ItemGroup key="all-vpcs" className="sidebar-menu-itemgroup" title="VPC Selector">
                    <Menu.Item key='/vpcs' icon={getIcon('vpcs')}>
                        <Link to={'/vpcs'}>VPCs ({this.state.vpcStats.vpcs})</Link>
                    </Menu.Item>
                    <Menu.Item key='/recentvpcs' icon={getIcon('vpcs')}>
                        <Link to={'/recentvpcs'}>Recent VPCs</Link>
                    </Menu.Item>
                </Menu.ItemGroup>

                <Menu.ItemGroup key="filtered-vpc" className="sidebar-menu-itemgroup" title={vpcText} >
                    <Menu.Item key='/vpcdashboard' icon={<DashboardOutlined />}>
                        <Link to={'/vpcdashboard' + vpcSearch}>VPC Dashboard</Link>
                    </Menu.Item>
                    <Menu.Item key='/subnets' icon={getIcon('subnets')}>
                        <Link to={'/subnets' + vpcSearch}>Subnets ({this.state.vpcStats.subnets})</Link>
                    </Menu.Item>
                    <Menu.Item key='/route-tables' icon={getIcon('route-tables')}>
                        <Link to={'/route-tables' + vpcSearch}>Route Tables ({this.state.vpcStats.route_tables})</Link>
                    </Menu.Item>
                    <Menu.Item key='/security-groups' icon={getIcon('security-groups')}>
                        <Link to={'/security-groups' + vpcSearch}>Security Groups ({this.state.vpcStats.security_groups})</Link>
                    </Menu.Item>
                    <Menu.Item key='/instances' icon={getIcon('instances')}>
                        <Link to={'/instances' + vpcSearch}>Instances ({this.state.vpcStats.instances})</Link>
                    </Menu.Item>
                </Menu.ItemGroup>
            </Menu>
        )
    }

    getVpcStats = () => {
        var vpcId = vpcFilter(this.props.location.search, false)
        var url = '/api/vpcdashboard/' + vpcId
        axios.get(url).then(rsp => {
            this.setState({ vpcStats: rsp.data })
        })
    }
}