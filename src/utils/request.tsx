import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';

// 开发环境使用代理，生产环境使用完整URL
const isDevelopment = import.meta.env.MODE === 'development';
const baseURL = isDevelopment ? '/api' : import.meta.env.VITE_API_BASE_URL || '/api';

console.log('当前环境:', import.meta.env.MODE);
console.log('baseURL:', baseURL);

const request: AxiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 10000,
});

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    console.log('请求拦截器 - 当前token:', token);
    console.log('请求完整URL:', config.url);
    
    if (token) {
      config.headers = config.headers || {};
      config.headers.token = token;
      console.log('已添加token头');
    }
    
    return config;
  },
  (error) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('响应成功:', response.config.url, '状态:', response.status);
    return response;
  },
  (error) => {
    console.error('响应拦截器 - 请求失败:', error);
    console.error('错误详情:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url
    });
    
    if (error.response) {
      const { status } = error.response;
      
      if (status === 401) {
        message.error('登录已过期，请重新登录');
        localStorage.removeItem('token');
        window.location.href = '/user';
      } else if (status === 404) {
        message.error('请求的资源不存在，请检查后端服务');
      }
    } else if (error.code === 'ECONNREFUSED' || error.message.includes('404')) {
      message.error('无法连接到后端服务，请检查服务是否启动');
    }
    
    return Promise.reject(error);
  }
);

export const http = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return request.get(url, config).then(response => response.data);
  },
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return request.post(url, data, config).then(response => response.data);
  },
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return request.put(url, data, config).then(response => response.data);
  },
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return request.delete(url, config).then(response => response.data);
  },
};

export default request;