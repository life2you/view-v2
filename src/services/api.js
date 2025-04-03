import axios from 'axios';

/**
 * 创建API服务实例
 * @param {string} baseURL - API基础URL
 * @returns {Object} - API服务对象
 */
const createApiService = (baseURL) => {
  // 创建axios实例
  const api = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 15000, // 15秒超时
  });

  // 添加请求拦截器
  api.interceptors.request.use(
    (config) => {
      // 在发送请求之前做些什么
      return config;
    },
    (error) => {
      // 对请求错误做些什么
      console.error('请求拦截器错误:', error);
      return Promise.reject(error);
    }
  );

  // 添加响应拦截器
  api.interceptors.response.use(
    (response) => {
      // 对响应数据做点什么
      return response;
    },
    (error) => {
      // 对响应错误做点什么
      let message = '未知错误';
      
      if (error.response) {
        // 服务器返回了错误状态码
        switch (error.response.status) {
          case 400:
            message = '请求参数错误';
            break;
          case 401:
            message = '未授权，请重新登录';
            break;
          case 403:
            message = '拒绝访问';
            break;
          case 404:
            message = '请求的资源不存在';
            break;
          case 422:
            message = '请求格式正确，但是由于含有语义错误，无法响应';
            if (error.response.data && error.response.data.detail) {
              message += `: ${error.response.data.detail}`;
            }
            break;
          case 500:
            message = '服务器内部错误';
            break;
          case 501:
            message = '服务未实现';
            break;
          case 502:
            message = '网关错误';
            break;
          case 503:
            message = '服务不可用';
            break;
          case 504:
            message = '网关超时';
            break;
          default:
            message = `错误: ${error.response.status}`;
        }
      } else if (error.request) {
        // 请求已经发出，但没有收到响应
        message = '网络异常，无法连接到服务器';
      } else {
        // 在设置请求时发生了一些事情，触发了错误
        message = error.message || '请求异常';
      }
      
      // 为错误对象添加自定义的消息
      error.customMessage = message;
      console.error('API错误:', message);
      return Promise.reject(error);
    }
  );

  // 过滤掉空值参数（空字符串、null或undefined）
  const filterEmptyParams = (params) => {
    const filteredParams = {};
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== null && value !== undefined && value !== '') {
        filteredParams[key] = value;
      }
    });
    return filteredParams;
  };

  return {
    // 代币相关接口
    tokens: {
      // 获取代币列表
      getList: (params = {}) => {
        const filteredParams = filterEmptyParams(params);
        return api.get('/api/tokens', { params: filteredParams });
      },
      
      // 获取代币详情
      getDetails: (mint) => {
        // 确保mint参数是有效的，并进行URL编码避免特殊字符问题
        if (!mint) {
          return Promise.reject(new Error('代币地址不能为空'));
        }
        
        // URL编码mint参数，避免特殊字符导致的问题
        const encodedMint = encodeURIComponent(mint);
        return api.get(`/api/tokens/${encodedMint}`);
      },
      
      // 获取代币回复列表
      getReplies: (mint, params = {}) => {
        // 确保mint参数是有效的
        if (!mint) {
          return Promise.reject(new Error('代币地址不能为空'));
        }
        
        // URL编码mint参数
        const encodedMint = encodeURIComponent(mint);
        const filteredParams = filterEmptyParams(params);
        return api.get(`/api/tokens/${encodedMint}/replies`, { params: filteredParams });
      },
      
      // 获取代币交易列表
      getTrades: (mint, params = {}) => {
        // 确保mint参数是有效的
        if (!mint) {
          return Promise.reject(new Error('代币地址不能为空'));
        }
        
        // URL编码mint参数
        const encodedMint = encodeURIComponent(mint);
        const filteredParams = filterEmptyParams(params);
        return api.get(`/api/tokens/${encodedMint}/trades`, { params: filteredParams });
      },
    },
  };
};

export default createApiService; 