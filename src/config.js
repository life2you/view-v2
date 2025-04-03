/**
 * 项目配置文件
 * 可以在这里修改后端服务地址和端口
 */

// 后端服务主机地址
const API_HOST = 'localhost';

// 后端服务端口
const API_PORT = 8000;

// 后端服务协议（http 或 https）
const API_PROTOCOL = 'http';

// 构建完整的API基础URL
export const API_BASE_URL = `${API_PROTOCOL}://${API_HOST}:${API_PORT}`;

// 其他配置
export const CONFIG = {
  // 页面标题
  appTitle: 'Pump Data 前端',
  
  // 默认分页大小
  defaultPageSize: 10,
  
  // 是否使用本地存储保存API地址设置
  useLocalStorage: true,
  
  // 数据自动刷新间隔（毫秒）
  autoRefreshInterval: 5000,
  
  // 主题配置
  theme: {
    // 主色调
    primaryColor: '#1890ff',
    // 成功色
    successColor: '#52c41a',
    // 警告色
    warningColor: '#faad14',
    // 错误色
    errorColor: '#f5222d',
    // 卡片阴影
    cardShadow: '0 2px 8px rgba(0, 0, 0, 0.09)',
    // 过渡动画时间
    transitionDuration: '0.3s',
    // 表格条纹颜色
    tableStripedColor: 'rgba(0, 0, 0, 0.02)',
    // 背景渐变
    backgroundGradient: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
  }
}; 