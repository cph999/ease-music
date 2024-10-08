const express = require('express');
const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // 允许所有域名
    // 或者
    // res.header('Access-Control-Allow-Origin', 'https://允许的域名.com');
    next();
});

// 你的其他路由和中间件...