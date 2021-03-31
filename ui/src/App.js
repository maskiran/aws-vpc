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
                {/* <Layout.Header style={{ padding: "0px 20px" }}>
                    <Route path="/" component={PageHeader} />
                </Layout.Header> */}
                <Layout>
                    <Layout.Sider collapsible width="250" theme="light"
                        style={{ boxShadow: "0px 0px 10px 0px #777777" }}>
                        <Route path="/" component={AppSidebar} />
                    </Layout.Sider>
                    <Layout.Content style={{ padding: "20px 20px", backgroundColor2: "red" }}>
                        {Routes}
                    </Layout.Content>
                </Layout>
            </Layout>
        </BrowserRouter>
    }
}