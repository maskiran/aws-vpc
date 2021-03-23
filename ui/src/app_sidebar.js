import React from 'react';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';
import { BorderlessTableOutlined } from '@ant-design/icons';
import { FaNetworkWired } from 'react-icons/fa';
import { MdSecurity } from 'react-icons/md';
import { GrVirtualMachine } from 'react-icons/gr';


export default class AppSidebar extends React.Component {
    render() {
        var sidebarKey = this.props.location.pathname
        return (
            <Menu mode="inline" theme="light" selectedKeys={[sidebarKey]}
                style={{minHeight2: "100%"}}
                defaultOpenKeys={["sub1", "sub2", "sub3", "sub4", "sub5", "sub6"]}
            >
                <Menu.ItemGroup key="sub1" title="Networking" className="sidebar-menu-itemgroup">
                    <Menu.Item key='/vpcs' icon={<FaNetworkWired />}>
                        <Link to={'/vpcs'}>VPCs</Link>
                    </Menu.Item>
                    <Menu.Item key='/subnets' icon={<FaNetworkWired />}>
                        <Link to={'/subnets'}>Subnets</Link>
                    </Menu.Item>
                    <Menu.Item key='/route-tables' icon={<BorderlessTableOutlined />}>
                        <Link to={'/route-tables'}>Route Tables</Link>
                    </Menu.Item>
                    <Menu.Item key='/security-groups' icon={<MdSecurity />}>
                        <Link to={'/security-groups'}>Security Groups</Link>
                    </Menu.Item>
                </Menu.ItemGroup>
                <Menu.ItemGroup key="sub2" title="Compute" className="sidebar-menu-itemgroup">
                    <Menu.Item key='/instances' icon={<GrVirtualMachine />}>
                        <Link to={'/instances'}>Instances</Link>
                    </Menu.Item>
                </Menu.ItemGroup>
            </Menu>
        )
    }
}