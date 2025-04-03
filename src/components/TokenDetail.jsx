import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Card, Tabs, Typography, Row, Col, Statistic, Spin, Avatar, 
  Table, Descriptions, Empty, Tag, Tooltip, Badge, Space,
  Divider, Button
} from 'antd';
import { 
  ArrowUpOutlined, ArrowDownOutlined, LinkOutlined, 
  UserOutlined, CalendarOutlined, FieldTimeOutlined,
  LikeOutlined
} from '@ant-design/icons';
import { useApiConfig } from '../contexts/ApiConfigContext';
import createApiService from '../services/api';
import moment from 'moment';
import { CONFIG } from '../config';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const TokenDetail = () => {
  const { mint } = useParams();
  const { apiUrl } = useApiConfig();
  const apiService = createApiService(apiUrl);

  const [tokenData, setTokenData] = useState(null);
  const [trades, setTrades] = useState([]);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tradePagination, setTradePagination] = useState({
    current: 1,
    pageSize: CONFIG.defaultPageSize,
    total: 0
  });
  const [replyPagination, setReplyPagination] = useState({
    current: 1,
    pageSize: CONFIG.defaultPageSize,
    total: 0
  });

  // 获取代币详情
  const fetchTokenDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.tokens.getDetails(mint);
      setTokenData(response.data);
    } catch (error) {
      console.error('获取代币详情失败:', error);
      setError(`获取代币详情失败: ${error.customMessage || error.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  // 获取交易列表
  const fetchTrades = async (page = 1, limit = CONFIG.defaultPageSize) => {
    try {
      const response = await apiService.tokens.getTrades(mint, { page, limit });
      setTrades(response.data.items);
      setTradePagination({
        current: response.data.page,
        pageSize: response.data.limit,
        total: response.data.total
      });
    } catch (error) {
      console.error('获取交易列表失败:', error);
      // 不阻止整个页面加载，只是显示空数据
      setTrades([]);
    }
  };

  // 获取回复列表
  const fetchReplies = async (page = 1, limit = CONFIG.defaultPageSize) => {
    try {
      const response = await apiService.tokens.getReplies(mint, { page, limit });
      setReplies(response.data.items);
      setReplyPagination({
        current: response.data.page,
        pageSize: response.data.limit,
        total: response.data.total
      });
    } catch (error) {
      console.error('获取回复列表失败:', error);
      // 不阻止整个页面加载，只是显示空数据
      setReplies([]);
    }
  };

  useEffect(() => {
    if (mint && apiUrl) {
      fetchTokenDetail();
      fetchTrades();
      fetchReplies();
    }
  }, [mint, apiUrl]);

  const handleTradeTableChange = (pagination) => {
    fetchTrades(pagination.current, pagination.pageSize);
  };

  const handleReplyTableChange = (pagination) => {
    fetchReplies(pagination.current, pagination.pageSize);
  };

  // 交易表格列
  const tradeColumns = [
    {
      title: '类型',
      key: 'type',
      render: (_, record) => (
        <Tag 
          color={record.is_buy ? CONFIG.theme.successColor : CONFIG.theme.errorColor}
          icon={record.is_buy ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
        >
          {record.is_buy ? '买入' : '卖出'}
        </Tag>
      )
    },
    {
      title: '用户',
      dataIndex: 'username',
      key: 'username',
      render: (username) => (
        <Space>
          <UserOutlined />
          <Text strong>{username}</Text>
        </Space>
      )
    },
    {
      title: 'SOL金额',
      dataIndex: 'sol_amount',
      key: 'sol_amount',
      render: (value, record) => (
        <Text style={{ 
          color: record.is_buy ? CONFIG.theme.successColor : CONFIG.theme.errorColor,
          fontWeight: 'bold'
        }}>
          {value.toFixed(4)} SOL
        </Text>
      )
    },
    {
      title: '代币数量',
      dataIndex: 'token_amount',
      key: 'token_amount',
      render: (value) => (
        <Text strong>{value.toLocaleString(undefined, { maximumFractionDigits: 4 })}</Text>
      )
    },
    {
      title: '时间',
      dataIndex: 'datetime',
      key: 'datetime',
      render: (date) => (
        <Tooltip title={moment(date).format('YYYY-MM-DD HH:mm:ss')}>
          <Space>
            <FieldTimeOutlined />
            {moment(date).fromNow()}
          </Space>
        </Tooltip>
      )
    },
    {
      title: '交易签名',
      dataIndex: 'tx_signature',
      key: 'tx_signature',
      ellipsis: true,
      render: (sig) => (
        <Tooltip title={sig}>
          <Space>
            <LinkOutlined />
            <Text copyable>{`${sig.slice(0, 8)}...${sig.slice(-8)}`}</Text>
          </Space>
        </Tooltip>
      )
    }
  ];

  // 回复表格列
  const replyColumns = [
    {
      title: '用户',
      dataIndex: 'username',
      key: 'username',
      render: (username, record) => (
        <Space>
          <UserOutlined />
          <Text strong>{username}</Text>
          {record.is_buy ? (
            <Tag color={CONFIG.theme.successColor}>买入</Tag>
          ) : (
            <Tag color={CONFIG.theme.errorColor}>卖出</Tag>
          )}
        </Space>
      )
    },
    {
      title: '内容',
      dataIndex: 'text',
      key: 'text',
      render: (text) => (
        <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: '更多' }}>{text}</Paragraph>
      )
    },
    {
      title: '时间',
      dataIndex: 'datetime',
      key: 'datetime',
      render: (date) => (
        <Tooltip title={moment(date).format('YYYY-MM-DD HH:mm:ss')}>
          <Space>
            <FieldTimeOutlined />
            {moment(date).fromNow()}
          </Space>
        </Tooltip>
      )
    },
    {
      title: '点赞',
      dataIndex: 'total_likes',
      key: 'total_likes',
      render: (likes) => (
        <Badge 
          count={likes} 
          showZero 
          overflowCount={999}
          style={{ 
            backgroundColor: likes > 0 ? CONFIG.theme.warningColor : '#d9d9d9'
          }}
        >
          <LikeOutlined style={{ fontSize: '18px' }} />
        </Badge>
      )
    }
  ];

  // 交替行背景色
  const getRowClassName = (record, index) => {
    return index % 2 === 0 ? '' : 'striped-row';
  };

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '100px 0',
        background: 'white',
        borderRadius: '8px',
        boxShadow: CONFIG.theme.cardShadow
      }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">正在加载代币数据...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '100px 0',
        background: 'white',
        borderRadius: '8px',
        boxShadow: CONFIG.theme.cardShadow
      }}>
        <Empty 
          description={
            <div>
              <Text type="danger" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {error}
              </Text>
              <div style={{ marginTop: 16 }}>
                <Button type="primary" onClick={fetchTokenDetail}>
                  重试
                </Button>
              </div>
            </div>
          } 
        />
      </div>
    );
  }

  if (!tokenData) {
    return (
      <Empty 
        description="未找到代币数据" 
        style={{ 
          padding: '100px 0',
          background: 'white',
          borderRadius: '8px',
          boxShadow: CONFIG.theme.cardShadow
        }}
      />
    );
  }

  return (
    <div>
      <style jsx>{`
        .ant-table-row {
          transition: all ${CONFIG.theme.transitionDuration};
        }
        .striped-row {
          background-color: ${CONFIG.theme.tableStripedColor};
        }
        .ant-table-row:hover {
          box-shadow: ${CONFIG.theme.cardShadow};
          transform: translateY(-1px);
        }
        .token-stat-card {
          transition: all ${CONFIG.theme.transitionDuration};
        }
        .token-stat-card:hover {
          transform: translateY(-5px);
          box-shadow: ${CONFIG.theme.cardShadow};
        }
      `}</style>
      
      <Card 
        style={{ 
          boxShadow: CONFIG.theme.cardShadow,
          borderRadius: '8px',
          marginBottom: '20px' 
        }}
      >
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} sm={8} md={6} lg={4}>
            {tokenData.uri ? (
              <Avatar 
                size={120} 
                src={tokenData.uri} 
                style={{ 
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                  border: `4px solid ${CONFIG.theme.primaryColor}`
                }}
              />
            ) : (
              <Avatar 
                size={120} 
                style={{ 
                  backgroundColor: CONFIG.theme.primaryColor,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                  fontSize: '48px'
                }}
              >
                {tokenData.symbol?.slice(0, 2)}
              </Avatar>
            )}
          </Col>
          <Col xs={24} sm={16} md={18} lg={20}>
            <Title level={2}>
              {tokenData.name} 
              <Tag 
                color={CONFIG.theme.primaryColor} 
                style={{ 
                  marginLeft: 12, 
                  fontSize: '16px',
                  padding: '2px 10px'
                }}
              >
                {tokenData.symbol}
              </Tag>
            </Title>
            
            <Paragraph>
              <Text strong>代币地址: </Text>
              <Text 
                copyable={{ 
                  text: tokenData.mint,
                  tooltips: ['复制地址', '已复制!'] 
                }}
                style={{ color: CONFIG.theme.primaryColor }}
              >
                {tokenData.mint}
              </Text>
            </Paragraph>
            
            <Divider style={{ margin: '12px 0' }} />
            
            <Descriptions column={{ xs: 1, sm: 2, md: 3, lg: 3 }} size="small">
              <Descriptions.Item label={<><UserOutlined /> 创建者</>}>
                <Text copyable={{ text: tokenData.creator }}>
                  {tokenData.creator_name || `${tokenData.creator.slice(0, 8)}...${tokenData.creator.slice(-4)}`}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label={<><CalendarOutlined /> 创建时间</>}>
                {moment(tokenData.created_at).format('YYYY-MM-DD')}
              </Descriptions.Item>
              <Descriptions.Item label="最大供应量">
                {tokenData.max_supply?.toLocaleString() || '未知'}
              </Descriptions.Item>
            </Descriptions>
            
            {tokenData.description && (
              <div style={{ marginTop: 16 }}>
                <Text strong>描述：</Text>
                <Paragraph 
                  ellipsis={{ rows: 3, expandable: true, symbol: '更多' }}
                  style={{ 
                    marginTop: 8,
                    background: '#f5f5f5',
                    padding: 12,
                    borderRadius: 4
                  }}
                >
                  {tokenData.description}
                </Paragraph>
              </div>
            )}
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable className="token-stat-card">
            <Statistic 
              title="池中SOL数量" 
              value={tokenData.v_sol_in_bonding_curve} 
              precision={4} 
              suffix="SOL"
              valueStyle={{ color: CONFIG.theme.primaryColor }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable className="token-stat-card">
            <Statistic 
              title="池中代币数量" 
              value={tokenData.v_tokens_in_bonding_curve} 
              precision={2}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable className="token-stat-card">
            <Statistic 
              title="买入次数" 
              value={tokenData.buy_count} 
              valueStyle={{ color: CONFIG.theme.successColor }}
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable className="token-stat-card">
            <Statistic 
              title="卖出次数" 
              value={tokenData.sell_count} 
              valueStyle={{ color: CONFIG.theme.errorColor }}
              prefix={<ArrowDownOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card 
        style={{ 
          boxShadow: CONFIG.theme.cardShadow,
          borderRadius: '8px',
        }}
      >
        <Tabs 
          defaultActiveKey="trades"
          type="card"
          animated={{ inkBar: true, tabPane: true }}
        >
          <TabPane 
            tab={
              <span>
                <Badge count={tradePagination.total} overflowCount={999}>
                  <span style={{ paddingRight: 15 }}>交易记录</span>
                </Badge>
              </span>
            } 
            key="trades"
          >
            <Table 
              rowKey="id"
              columns={tradeColumns} 
              dataSource={trades} 
              pagination={tradePagination}
              onChange={handleTradeTableChange}
              scroll={{ x: 800 }}
              rowClassName={getRowClassName}
            />
          </TabPane>
          <TabPane 
            tab={
              <span>
                <Badge count={replyPagination.total} overflowCount={999}>
                  <span style={{ paddingRight: 15 }}>回复列表</span>
                </Badge>
              </span>
            } 
            key="replies"
          >
            <Table 
              rowKey="id"
              columns={replyColumns} 
              dataSource={replies} 
              pagination={replyPagination}
              onChange={handleReplyTableChange}
              scroll={{ x: 800 }}
              rowClassName={getRowClassName}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default TokenDetail; 