import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Routes from './routes';
import PageHeader from './page_header';
import 'antd/dist/antd.css';
import './App.css';

export default class App extends React.Component {
    render() {
        return <BrowserRouter>
            <Layout style={{minHeight: "100vh"}}>
                <Layout.Header>
                    <Route path="/" component={PageHeader}/>
                </Layout.Header>
                <Layout.Content style={{minHeight: "calc(100vh - 64px)", height: "calc(100vh - 64px)"}}>
                    {Routes}
                </Layout.Content>
            </Layout>
        </BrowserRouter>
    }
}