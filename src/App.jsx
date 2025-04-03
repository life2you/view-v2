import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu, Typography, theme, ConfigProvider } from 'antd';
import { ApiConfigProvider } from './contexts/ApiConfigContext';
import ApiConfig from './components/ApiConfig';
import TokenList from './components/TokenList';
import TokenDetail from './components/TokenDetail';
import { CONFIG } from './config';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

// 自定义样式
const styles = {
  layout: {
    minHeight: '100vh',
    background: CONFIG.theme.backgroundGradient,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 24px',
    background: CONFIG.theme.primaryColor,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  },
  headerContent: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    color: 'white',
    margin: 0,
    fontWeight: 'bold',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
  },
  content: {
    padding: '24px 48px',
    transition: `all ${CONFIG.theme.transitionDuration}`,
  },
  configWrapper: {
    marginBottom: 20,
    background: 'white',
    padding: '12px 20px',
    borderRadius: '8px',
    boxShadow: CONFIG.theme.cardShadow,
  },
  mainContent: {
    background: 'white',
    borderRadius: '8px',
    padding: 24,
    minHeight: 'calc(100vh - 200px)',
    boxShadow: CONFIG.theme.cardShadow,
  },
  footer: {
    textAlign: 'center',
    background: 'transparent',
  },
};

const App = () => {
  // 设置Ant Design主题
  const customTheme = {
    token: {
      colorPrimary: CONFIG.theme.primaryColor,
      colorSuccess: CONFIG.theme.successColor,
      colorWarning: CONFIG.theme.warningColor,
      colorError: CONFIG.theme.errorColor,
      borderRadius: 8,
    },
  };

  return (
    <ConfigProvider theme={customTheme}>
      <ApiConfigProvider>
        <Router>
          <Layout style={styles.layout}>
            <Header style={styles.header}>
              <div style={styles.headerContent}>
                <Title level={3} style={styles.logo}>
                  {CONFIG.appTitle}
                </Title>
                <Menu
                  theme="dark"
                  mode="horizontal"
                  defaultSelectedKeys={['1']}
                  style={{ flex: 1, minWidth: 0, background: 'transparent', borderBottom: 'none' }}
                  items={[
                    {
                      key: '1',
                      label: <Link to="/" style={{ fontSize: '16px' }}>代币列表</Link>,
                    },
                  ]}
                />
              </div>
            </Header>
            <Content style={styles.content}>
              <div style={styles.configWrapper}>
                <ApiConfig />
              </div>
              <div style={styles.mainContent}>
                <Routes>
                  <Route path="/" element={<TokenList />} />
                  <Route path="/tokens/:mint" element={<TokenDetail />} />
                </Routes>
              </div>
            </Content>
            <Footer style={styles.footer}>
              <Typography.Text style={{ color: 'rgba(0, 0, 0, 0.5)' }}>
                {CONFIG.appTitle} ©{new Date().getFullYear()} 前后端分离项目
              </Typography.Text>
            </Footer>
          </Layout>
        </Router>
      </ApiConfigProvider>
    </ConfigProvider>
  );
};

export default App; 