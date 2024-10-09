import axios from 'axios';

export const instance = axios.create({
    baseURL: 'https://app102.acapp.acwing.com.cn/api',
    // baseURL: 'http://localhost:8809/api',

    headers: {
        'Content-Type': 'application/json',
    }
});