import React from 'react'
import { Input, Menu, Row, Col } from 'antd'
import qs from 'query-string'

export default class PageHeader extends React.Component {
    state = {
        searchVal: qs.parse(this.props.location.search).search
    }

    componentDidUpdate = (prevProps) => {
        // update search value if the user naviagtes back/forth in the page
        var oldSearch = qs.parse(prevProps.location.search).search 
        var newSearch = qs.parse(this.props.location.search).search
        if (oldSearch !== newSearch) {
            this.setState({searchVal: newSearch})
        }
    }

    render() {
        return <Menu mode="horizontal" theme="dark">
            <Menu.Item style={{ width: "50%", marginLeft: "25%" }}>
                <Input.Search style={{ verticalAlign: "middle" }}
                    value={this.state.searchVal}
                    onChange={this.handleSearchChange}
                    onSearch={this.handleSearch} />
            </Menu.Item>
        </Menu >
    }

    handleSearchChange  = (e) => {
        this.setState({searchVal: e.target.value})
    }

    handleSearch = (text) => {
        var search = "search=" + text
        this.props.history.push({ search: search })
    }
}