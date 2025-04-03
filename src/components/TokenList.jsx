import React, { useState, useEffect, useRef } from 'react';
import { Table, Input, Select, Form, Space, Card, Tooltip, Badge, Typography, Button, Tag, Alert } from 'antd';
import { SearchOutlined, SyncOutlined, ReloadOutlined, ClockCircleOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useApiConfig } from '../contexts/ApiConfigContext';
import createApiService from '../services/api';
import moment from 'moment';
import { CONFIG } from '../config';

const { Text, Title } = Typography;
const { Option } = Select;

const TokenList = () => {
  const { apiUrl } = useApiConfig();
  const apiService = createApiService(apiUrl);
  
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: CONFIG.defaultPageSize,
    total: 0
  });
  const [filters, setFilters] = useState({
    name: '',
    symbol: '',
    min_sol: '',
    max_sol: '',
    sort: 'v_sol_in_bonding_curve',
    order: 'desc'
  });
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  
  // 使用ref保存定时器ID
  const timerRef = useRef(null);

  // 获取数据函数
  const fetchData = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = {
        page: params.pagination?.current || pagination.current,
        limit: params.pagination?.pageSize || pagination.pageSize,
        sort: params.filters?.sort || filters.sort,
        order: params.filters?.order || filters.order,
        name: params.filters?.name || filters.name,
        symbol: params.filters?.symbol || filters.symbol,
      };
      
      // 只有当这些值有效时才添加到查询参数中
      if (params.filters?.min_sol || filters.min_sol) {
        queryParams.min_sol = Number(params.filters?.min_sol || filters.min_sol);
      }
      
      if (params.filters?.max_sol || filters.max_sol) {
        queryParams.max_sol = Number(params.filters?.max_sol || filters.max_sol);
      }

      const response = await apiService.tokens.getList(queryParams);
      
      setData(response.data.items);
      setPagination({
        ...pagination,
        current: response.data.page,
        pageSize: response.data.limit,
        total: response.data.total
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('获取代币列表失败:', error);
      setError('获取数据失败，请检查API地址是否正确或稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 自动刷新控制
  useEffect(() => {
    // 组件挂载时，立即获取数据
    fetchData();
    
    // 如果启用了自动刷新，则设置定时器
    if (autoRefresh) {
      timerRef.current = setInterval(() => {
        fetchData();
      }, CONFIG.autoRefreshInterval);
    }

    // 组件卸载时，清除定时器
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [apiUrl, autoRefresh]); // 当API地址或自动刷新状态变化时重新设置

  // 当自动刷新状态变化时，设置或清除定时器
  useEffect(() => {
    if (autoRefresh) {
      timerRef.current = setInterval(() => {
        fetchData();
      }, CONFIG.autoRefreshInterval);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [autoRefresh]);

  const handleTableChange = (newPagination, _, sorter) => {
    const newFilters = { ...filters };
    
    if (sorter.field && sorter.order) {
      newFilters.sort = sorter.field;
      newFilters.order = sorter.order === 'ascend' ? 'asc' : 'desc';
    }
    
    setFilters(newFilters);
    fetchData({
      pagination: newPagination,
      filters: newFilters
    });
  };

  const handleFilterChange = (values) => {
    // 处理数值类型
    const processedValues = { ...values };
    
    // 将空字符串转为undefined
    Object.keys(processedValues).forEach(key => {
      if (processedValues[key] === '') {
        processedValues[key] = undefined;
      }
    });
    
    // 确保数值字段为数字类型
    if (processedValues.min_sol) {
      processedValues.min_sol = Number(processedValues.min_sol);
    }
    
    if (processedValues.max_sol) {
      processedValues.max_sol = Number(processedValues.max_sol);
    }
    
    const newFilters = { ...filters, ...processedValues };
    setFilters(newFilters);
    setPagination({ ...pagination, current: 1 }); // 重置为第一页
    fetchData({ filters: newFilters, pagination: { ...pagination, current: 1 } });
  };

  // 切换自动刷新状态
  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  const columns = [
    {
      title: '代币地址',
      dataIndex: 'mint',
      key: 'mint',
      ellipsis: true,
      render: (mint) => (
        <Tooltip title={mint}>
          <Link to={`/tokens/${mint}`} style={{ color: CONFIG.theme.primaryColor, transition: `color ${CONFIG.theme.transitionDuration}` }}>
            {mint.slice(0, 8)}...{mint.slice(-4)}
          </Link>
        </Tooltip>
      )
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: '符号',
      dataIndex: 'symbol',
      key: 'symbol',
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      render: (text) => <Tag color={CONFIG.theme.primaryColor}>{text}</Tag>
    },
    {
      title: '池中SOL数量',
      dataIndex: 'v_sol_in_bonding_curve',
      key: 'v_sol_in_bonding_curve',
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      defaultSortOrder: 'descend',
      render: (value) => (
        <Text style={{ color: CONFIG.theme.primaryColor, fontWeight: 'bold' }}>
          {value.toFixed(4)} SOL
        </Text>
      )
    },
    {
      title: '池中代币数量',
      dataIndex: 'v_tokens_in_bonding_curve',
      key: 'v_tokens_in_bonding_curve',
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      render: (value) => value.toLocaleString()
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      render: (date) => (
        <Tooltip title={moment(date).format('YYYY-MM-DD HH:mm:ss')}>
          {moment(date).format('YYYY-MM-DD')}
        </Tooltip>
      )
    },
    {
      title: '交易',
      key: 'trades',
      render: (_, record) => (
        <Space>
          <Badge count={record.buy_count || 0} showZero style={{ backgroundColor: CONFIG.theme.successColor }}>
            <Tag color={CONFIG.theme.successColor} style={{ marginRight: 0 }}>买入</Tag>
          </Badge>
          <Badge count={record.sell_count || 0} showZero style={{ backgroundColor: CONFIG.theme.errorColor }}>
            <Tag color={CONFIG.theme.errorColor} style={{ marginRight: 0 }}>卖出</Tag>
          </Badge>
        </Space>
      )
    },
    {
      title: '回复数量',
      dataIndex: 'reply_count',
      key: 'reply_count',
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      render: (value) => (
        <Badge 
          count={value || 0} 
          showZero 
          overflowCount={999}
          style={{ backgroundColor: value > 0 ? CONFIG.theme.warningColor : '#d9d9d9' }}
        />
      )
    }
  ];

  // 交替行背景色
  const getRowClassName = (record, index) => {
    return index % 2 === 0 ? '' : 'striped-row';
  };

  // 表格样式
  const tableStyle = {
    '.ant-table-thead > tr > th': {
      background: '#f5f5f5',
    },
    '.striped-row': {
      backgroundColor: CONFIG.theme.tableStripedColor,
    },
    '.ant-table-row:hover': {
      boxShadow: CONFIG.theme.cardShadow,
      transform: 'translateY(-1px)',
      transition: `all ${CONFIG.theme.transitionDuration}`,
    },
  };

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
      `}</style>
      
      <Card 
        title={
          <Space>
            <Title level={4} style={{ margin: 0 }}>代币列表</Title>
            {lastUpdated && (
              <Text type="secondary" style={{ fontSize: '14px' }}>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                最近更新: {moment(lastUpdated).format('HH:mm:ss')}
              </Text>
            )}
          </Space>
        }
        extra={
          <Space>
            <Tooltip title={autoRefresh ? '关闭自动刷新' : '开启自动刷新'}>
              <Button
                type={autoRefresh ? 'primary' : 'default'}
                icon={<SyncOutlined spin={autoRefresh} />}
                onClick={toggleAutoRefresh}
              >
                {autoRefresh ? '自动刷新中' : '自动刷新'}
              </Button>
            </Tooltip>
            <Tooltip title="立即刷新">
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => fetchData()}
                loading={loading}
              >
                刷新
              </Button>
            </Tooltip>
          </Space>
        }
        style={{ 
          boxShadow: CONFIG.theme.cardShadow,
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        {error && (
          <Alert
            message="错误"
            description={error}
            type="error"
            showIcon
            closable
            style={{ marginBottom: 16 }}
          />
        )}
        
        <Form 
          layout="inline" 
          style={{ marginBottom: 16 }} 
          onFinish={handleFilterChange}
        >
          <Form.Item name="name" label="名称">
            <Input 
              placeholder="搜索代币名称"
              allowClear
              prefix={<SearchOutlined />}
              style={{ borderRadius: '4px' }}
            />
          </Form.Item>
          <Form.Item name="symbol" label="符号">
            <Input 
              placeholder="搜索代币符号"
              allowClear
              prefix={<SearchOutlined />}
              style={{ borderRadius: '4px' }}
            />
          </Form.Item>
          <Form.Item name="min_sol" label="最小SOL">
            <Input 
              type="number" 
              min={0} 
              placeholder="最小SOL" 
              style={{ borderRadius: '4px' }} 
            />
          </Form.Item>
          <Form.Item name="max_sol" label="最大SOL">
            <Input 
              type="number" 
              min={0} 
              placeholder="最大SOL" 
              style={{ borderRadius: '4px' }}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SearchOutlined />}
                style={{ borderRadius: '4px' }}
              >
                筛选
              </Button>
              <Button 
                onClick={() => {
                  // 重置表单
                  setFilters({
                    name: '',
                    symbol: '',
                    min_sol: '',
                    max_sol: '',
                    sort: 'v_sol_in_bonding_curve',
                    order: 'desc'
                  });
                  fetchData({
                    filters: {
                      sort: 'v_sol_in_bonding_curve',
                      order: 'desc'
                    },
                    pagination: { ...pagination, current: 1 }
                  });
                }}
                style={{ borderRadius: '4px' }}
              >
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>

        <Table 
          rowKey="mint"
          columns={columns} 
          dataSource={data} 
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
          rowClassName={getRowClassName}
          style={tableStyle}
        />
      </Card>
    </div>
  );
};

export default TokenList; 