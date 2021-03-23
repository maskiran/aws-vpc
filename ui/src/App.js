import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Routes from './routes';
import PageHeader from './page_header';
import AppSidebar from './app_sidebar';
import 'antd/dist/antd.css';
import './App.css';

export default class App extends React.Component {
    render() {
        return <BrowserRouter>
            <Layout style={{ minHeight: "100vh" }}>
                <Layout.Header>
                    <Route path="/" component={PageHeader} />
                </Layout.Header>
                <Layout>
                    <Layout.Sider collapsible width="200" theme="light">
                        <Route path="/" component={AppSidebar} />
                    </Layout.Sider>
                    <Layout.Content style={{ padding: "20px" }}>
                        {Routes}
                    </Layout.Content>
                </Layout>
            </Layout>
        </BrowserRouter>
    }
}