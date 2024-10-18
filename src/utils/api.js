import axios from 'axios';
import LocalStorageUtil from './LocalStorageUtil';

export const instance = axios.create({
    // baseURL: 'https://app102.acapp.acwing.com.cn/api',
    baseURL: 'http://localhost:8809/api',
        // baseURL: 'http://39.100.90.48:8809/api',

    headers: {
        'Content-Type': 'application/json',
    }
});

// 添加请求拦截器，在每次发送请求之前，检查是否有 token
instance.interceptors.request.use(
    (config) => {
        // 从 LocalStorageUtil 中获取 userinfo
        const userinfo = LocalStorageUtil.getItem('userinfo');

        // 如果存在 token，则将其添加到请求头中
        if (userinfo && userinfo.token) {
            config.headers['Authorization'] = userinfo.token;
        }

        return config;
    },
    (error) => {
        // 处理请求错误
        return Promise.reject(error);
    }
);

export default instance;
