import React, { useState } from 'react';
import { Form, Input, Button, Row, Col, message, Tooltip, Typography } from 'antd';
import { useApiConfig } from '../contexts/ApiConfigContext';
import { EditOutlined, SaveOutlined, CloseOutlined, ApiOutlined } from '@ant-design/icons';
import { CONFIG } from '../config';

const { Text } = Typography;

const ApiConfig = () => {
  const { apiUrl, updateApiUrl } = useApiConfig();
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);

  // 初始化表单值
  React.useEffect(() => {
    form.setFieldsValue({ apiUrl });
  }, [apiUrl, form]);

  const handleSubmit = (values) => {
    try {
      // 简单的URL验证
      new URL(values.apiUrl);
      updateApiUrl(values.apiUrl);
      message.success('API地址已更新');
      setIsEditing(false);
    } catch (error) {
      message.error('请输入有效的URL');
    }
  };

  if (!isEditing) {
    return (
      <Row align="middle">
        <Col>
          <ApiOutlined style={{ marginRight: 8, color: CONFIG.theme.primaryColor }} />
          <Text strong>当前API地址:</Text>
          <Text copyable={{ text: apiUrl }} style={{ marginLeft: 8 }}>
            {apiUrl}
          </Text>
        </Col>
        <Col style={{ marginLeft: 16 }}>
          <Tooltip title="修改API地址">
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              size="small" 
              onClick={() => setIsEditing(true)}
              style={{ 
                borderRadius: '4px',
                boxShadow: '0 2px 0 rgba(0, 0, 0, 0.045)'
              }}
            >
              修改
            </Button>
          </Tooltip>
        </Col>
      </Row>
    );
  }

  return (
    <Form 
      form={form} 
      onFinish={handleSubmit} 
      layout="inline"
      style={{
        transition: `all ${CONFIG.theme.transitionDuration}`,
      }}
    >
      <Form.Item
        name="apiUrl"
        rules={[{ required: true, message: '请输入API地址' }]}
        style={{ flexGrow: 1 }}
      >
        <Input 
          placeholder="请输入API地址" 
          prefix={<ApiOutlined style={{ color: CONFIG.theme.primaryColor }} />}
          style={{ borderRadius: '4px' }}
          autoFocus
        />
      </Form.Item>
      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          icon={<SaveOutlined />}
          style={{ 
            borderRadius: '4px', 
            marginRight: 8,
            boxShadow: '0 2px 0 rgba(0, 0, 0, 0.045)'
          }}
        >
          保存
        </Button>
        <Button 
          onClick={() => setIsEditing(false)} 
          icon={<CloseOutlined />}
          style={{ borderRadius: '4px' }}
        >
          取消
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ApiConfig; 