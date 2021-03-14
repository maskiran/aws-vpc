import React from 'react';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';
import { BorderlessTableOutlined, DashboardOutlined } from '@ant-design/icons';
import { FaNetworkWired } from 'react-icons/fa';
import { MdSecurity } from 'react-icons/md';
import {GrVirtualMachine} from 'react-icons/gr';


export default class VpcSidebar extends React.Component {
    render() {
        var sidebarKey = this.props.category;
        var baseUrl = '/vpcs/' + this.props.vpc_id;
        return (
            <Menu mode="inline" theme="light" selectedKeys={[sidebarKey]}
                defaultOpenKeys={["sub1", "sub2", "sub3", "sub4", "sub5", "sub6"]}
            >
                <Menu.ItemGroup key="sub1" title="Networking" className="sidebar-menu-itemgroup">
                    <Menu.Item key='subnets' icon={<FaNetworkWired />}>
                        <Link to={baseUrl + '/subnets'}>Subnets</Link>
                    </Menu.Item>
                    <Menu.Item key='route-tables' icon={<BorderlessTableOutlined />}>
                        <Link to={baseUrl + '/route-tables'}>Route Tables</Link>
                    </Menu.Item>
                    <Menu.Item key='security-groups' icon={<MdSecurity />}>
                        <Link to={baseUrl + '/security-groups'}>Security Groups</Link>
                    </Menu.Item>
                </Menu.ItemGroup>
                <Menu.ItemGroup key="sub2" title="Compute" className="sidebar-menu-itemgroup">
                    <Menu.Item key='instances' icon={<GrVirtualMachine />}>
                        <Link to={baseUrl + '/instances'}>Instances</Link>
                    </Menu.Item>
                </Menu.ItemGroup>
            </Menu>
        )
    }
}