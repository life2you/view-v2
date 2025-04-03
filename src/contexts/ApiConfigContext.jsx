import React, { createContext, useState, useContext } from 'react';
import { API_BASE_URL, CONFIG } from '../config';

// 创建上下文
export const ApiConfigContext = createContext();

// 上下文提供者组件
export const ApiConfigProvider = ({ children }) => {
  // 从本地存储获取保存的API地址，如果没有则使用配置文件中的地址
  const [apiUrl, setApiUrl] = useState(
    CONFIG.useLocalStorage && localStorage.getItem('apiUrl') 
      ? localStorage.getItem('apiUrl') 
      : API_BASE_URL
  );

  // 更新API地址并保存到本地存储
  const updateApiUrl = (url) => {
    if (CONFIG.useLocalStorage) {
      localStorage.setItem('apiUrl', url);
    }
    setApiUrl(url);
  };

  return (
    <ApiConfigContext.Provider value={{ apiUrl, updateApiUrl }}>
      {children}
    </ApiConfigContext.Provider>
  );
};

// 自定义Hook，方便组件使用上下文
export const useApiConfig = () => useContext(ApiConfigContext); 