import React from 'react';
import { HomeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';


class PageHeader extends React.Component {
    navItems = [
    ]

    render() {
        return <>
            <Link to="/vpcs"><HomeOutlined /></Link>
        </>
    }
}

export default PageHeader;