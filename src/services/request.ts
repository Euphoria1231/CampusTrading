/* eslint-disable @typescript-eslint/no-explicit-any */
import { message } from "antd";
import axios, { type AxiosRequestConfig } from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // timeout: 10000
});
// 添加请求拦截器
instance.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem('token');
    // console.log('请求拦截器 - 当前token:', token);
    console.log('请求完整URL:', config.url);

    if (token) {
      config.headers = config.headers || {};
      config.headers.token = token;
      console.log('已添加token头');
    }

    return config;
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 添加响应拦截器
instance.interceptors.response.use(
  function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    if (response.data) {

      return response.data;
    }
    return response;
  },
  function (error) {
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
export const request = (
  method: string,
  url: string,
  data?: any,
  config?: AxiosRequestConfig<any> | undefined
) => {
  switch (method.toLowerCase()) {
    case "get":
      return instance.get(url, config);
    case "post":
      return instance.post(url, data, config);
    case "put":
      return instance.put(url, data, config);
    case "delete":
      return instance.delete(url, config);
    default:
      throw new Error("该种请求方法不被支持");
  }
};

export interface IResponse<T> {
  errCode?: string;
  message?: string;
  data: T;
}
