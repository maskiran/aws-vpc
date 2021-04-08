import React from 'react'
import { Input, Menu } from 'antd'
import qs from 'query-string'
import { GiCloudRing } from 'react-icons/gi'

export default class PageHeader extends React.Component {
    state = {
        searchVal: qs.parse(this.props.location.search).search,
    }

    componentDidUpdate = (prevProps) => {
        if (this.props.location.search !== prevProps.location.search) {
            var newSearch = qs.parse(this.props.location.search).search
            this.setState({ searchVal: newSearch })
        }
    }

    render() {
        return <>
            <div className="logo"><GiCloudRing size="44px" /></div>
            <Menu mode="horizontal" theme="dark">
                <Input.Search style={{ paddingTop: "15px", width: "30%", float: "right" }}
                    value={this.state.searchVal}
                    onChange={this.handleSearchChange}
                    onSearch={this.handleSearch} />
            </Menu >
        </>
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