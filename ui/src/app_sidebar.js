import React from 'react'
import { Input, Menu } from 'antd'
import { Link } from 'react-router-dom'
import { DashboardOutlined, CloseCircleOutlined, HomeOutlined } from '@ant-design/icons'
import { Copy } from './utils'
import axios from 'axios'
import getIcon from './icons'
import qs from 'query-string'


export default class AppSidebar extends React.Component {
    state = {
        dashboard: {},
        searchVal: qs.parse(this.props.location.search).search,
    }

    componentDidMount() {
        this.getDashboard()
    }

    componentDidUpdate(prevProps) {
        if (this.props.location.search !== prevProps.location.search) {
            this.getDashboard()
            var newSearch = qs.parse(this.props.location.search).search
            this.setState({ searchVal: newSearch })
        }
    }

    render() {
        var sidebarKey = this.props.location.pathname
        var searchArgs = this.props.location.search
        var groupText = "All VPCs"
        if (searchArgs) {
            // get search or vpc_id
            var args = qs.parse(this.props.location.search)
            // add icon to clear the search go to the current searchless page
            groupText = <>
                <Copy text={args.search || args.vpc_id} maincopy={false} trim={22} />
                <Link to={this.props.location.pathname}><CloseCircleOutlined style={{ marginLeft: "10px" }} /></Link>
            </>
        }
        return <>
            <div style={{ margin: "20px 16px" }}>
                <Input.Search value={this.state.searchVal} onChange={this.handleSearchChange} onSearch={this.handleSearch} />
            </div>
            <Menu mode="inline" theme="dark" selectedKeys={[sidebarKey]}>
                <Menu.ItemGroup key="all-vpcs" className="sidebar-menu-itemgroup" title="Home">
                    <Menu.Item key='/accounts' icon={getIcon('accounts')}>
                        <Link to={'/accounts' + searchArgs}>Accounts ({this.state.dashboard.accounts})</Link>
                    </Menu.Item>
                    <Menu.Item key='/recentvpcs' icon={getIcon('vpcs')}>
                        <Link to={'/recentvpcs' + searchArgs}>Recent VPCs</Link>
                    </Menu.Item>
                </Menu.ItemGroup>

                <Menu.ItemGroup key="filtered-vpc" className="sidebar-menu-itemgroup" title={groupText} >
                    <Menu.Item key='/dashboard' icon={<DashboardOutlined />}>
                        <Link to={'/dashboard' + searchArgs}>Dashboard</Link>
                    </Menu.Item>
                    <Menu.Item key='/vpcs' icon={getIcon('vpcs')}>
                        <Link to={'/vpcs' + searchArgs}>VPCs ({this.state.dashboard.vpcs})</Link>
                    </Menu.Item>
                    <Menu.Item key='/route-tables' icon={getIcon('route-tables')}>
                        <Link to={'/route-tables' + searchArgs}>Route Tables ({this.state.dashboard.route_tables})</Link>
                    </Menu.Item>
                    <Menu.Item key='/subnets' icon={getIcon('subnets')}>
                        <Link to={'/subnets' + searchArgs}>Subnets ({this.state.dashboard.subnets})</Link>
                    </Menu.Item>
                    <Menu.Item key='/security-groups' icon={getIcon('security-groups')}>
                        <Link to={'/security-groups' + searchArgs}>Security Groups ({this.state.dashboard.security_groups})</Link>
                    </Menu.Item>
                    <Menu.Item key='/instances' icon={getIcon('instances')}>
                        <Link to={'/instances' + searchArgs}>Instances ({this.state.dashboard.instances})</Link>
                    </Menu.Item>
                    <Menu.Item key='/load-balancers' icon={getIcon('load-balancers')}>
                        <Link to={'/load-balancers' + searchArgs}>Load Balancers ({this.state.dashboard.load_balancers})</Link>
                    </Menu.Item>
                    <Menu.Item key='/tgw-attachments' icon={getIcon('tgw-attachments')}>
                        <Link to={'/tgw-attachments' + searchArgs}>TGW Attachments({this.state.dashboard.tgw_attachments})</Link>
                    </Menu.Item>
                </Menu.ItemGroup>
            </Menu>
        </>
    }

    getDashboard = () => {
        var url = '/api/dashboard' + this.props.location.search
        axios.get(url).then(rsp => {
            this.setState({ dashboard: rsp.data })
        })
    }

    handleSearchChange = (e) => {
        this.setState({ searchVal: e.target.value })
    }

    handleSearch = (text) => {
        var search = "search=" + text
        if (!text) {
            search = null
        }
        this.props.history.push({ search: search })
    }

}