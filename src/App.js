/* global chrome */

import './App.css';
import 'react-vant/es/styles';
import Home from './components/Home.tsx';
import SearchPage from './components/SearchPage.tsx';
import Chat from './components/Chat.tsx';
import Profile from './components/Profile.tsx';
import React, { useState, useEffect } from 'react';
import { FriendsO, HomeO, Search, SettingO } from '@react-vant/icons'
import { Card, Button, Overlay, Input, Form, Tabbar, Toast } from 'react-vant';
import LocalStorageUtil from './utils/LocalStorageUtil.js';
import { instance } from './utils/api';


function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [loginState, setLoginState] = useState(false); // 定义一个 state 变量存储用户名
  const [form] = Form.useForm()
  const [loginOrRegister, setLoginOrRegister] = useState('login');
  const [userinfo, setUserinfo] = useState({}); // 定义一个 state 变量存储用户名

  useEffect(() => {
    setUserinfo(LocalStorageUtil.getItem('userinfo')); //异步的
    if (LocalStorageUtil.getItem('userinfo') === null || JSON.stringify(LocalStorageUtil.getItem('userinfo')) === '{}') {
      Toast.fail('请先登录');
      setLoginState(false);
    } else {
      setLoginState(true);
    }
  }, []);


  const handleLogin = () => {
    const username = form.getFieldValue("username");
    const password = form.getFieldValue("password");
    instance.post("/login", {
      username: username,
      password: password
    }).then(res => {
      if (res.data.code === 200) {
        LocalStorageUtil.setItem('userinfo', res.data.data);
      }
      setUserinfo(res.data.data);
      setLoginState(true);
      Toast.success('登录成功');
    }).catch(error => {
      setLoginState(false);
      console.log("error", error)
    })
  };

  const handleRegister = () => {
    const username = form.getFieldValue("username");
    const password = form.getFieldValue("password");
    const phone = form.getFieldValue("phone");
    const nickname = form.getFieldValue("nickname");

    instance.post("/register", {
      username: username,
      password: password,
      nickname: nickname,
      phone: phone
    }).then(res => {
      if (res.data.code === 200) {
        setLoginOrRegister('login')
      }
      Toast.success('注册成功，请登录');
    }).catch(error => {
      setLoginState(false);
      console.log("error", error)
    })
  };

  const onFinish = values => {
    console.log(values)
  }
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home userinfo={userinfo} setUserinfo={setUserinfo} />;
      case 'search':
        return <SearchPage />;
      case 'chat':
        return <Chat userinfo={userinfo} />;
      case 'profile':
        return <Profile />;
      default:
        return <Home />;
    }
  };
  return (
    <>
      <Overlay visible={!loginState}>
        <div className='loginBox'>
          <Card round>
            <Card.Header border>
              <div className='loginHeader'>
                <Button round type='default' onClick={() => setLoginOrRegister('login')}>
                  登录
                </Button>
                <Button round type='default' onClick={() => setLoginOrRegister('register')}>
                  注册
                </Button>
              </div>
            </Card.Header>
            <Card.Body
              style={{
                height: '16vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Form
                form={form}
                onFinish={onFinish}
              >      <Form.Item
                tooltip={{
                  message:
                    'A prime is a natural number greater than 1 that has no positive divisors other than 1 and itself.',
                }}
                rules={[{ required: true, message: '请填写用户名' }]}
                name='username'
                label='用户名'
              >
                  <Input placeholder='请输入用户名' />
                </Form.Item>
                <Form.Item
                  rules={[{ required: true, message: '请填写密码' }]}
                  name='password'
                  label='密码'
                >
                  <Input placeholder='请输入密码' />
                </Form.Item>

                {
                  loginOrRegister === 'register' ?
                    <>
                      <Form.Item
                        rules={[{ required: true, message: '请填写昵称' }]}
                        name='nickname'
                        label='昵称'
                      >
                        <Input placeholder='请输入昵称' />
                      </Form.Item>

                      <Form.Item
                        name='phone'
                        label='手机号'
                      >
                        <Input placeholder='请输入手机号' />
                      </Form.Item>
                    </>
                    : <></>
                }
              </Form>
            </Card.Body>
            <Card.Footer border>
              {loginOrRegister === 'login' ?
                <Button type="primary" round block size="large" onClick={handleLogin}>
                  登录
                </Button> : <Button type="danger" round block size="large" onClick={handleRegister}>
                  注册
                </Button>
              }
            </Card.Footer>
          </Card>
        </div>
      </Overlay>
      {renderContent()}

      <Tabbar active={activeTab} onChange={setActiveTab}>
        <Tabbar.Item icon={<HomeO />} name="home">
          首页
        </Tabbar.Item>
        <Tabbar.Item icon={<Search />} name="search" badge={{ dot: true }}>
          搜索
        </Tabbar.Item>
        <Tabbar.Item icon={<FriendsO />} name="chat" badge={{ content: 5 }}>
          聊天
        </Tabbar.Item>
        <Tabbar.Item icon={<SettingO />} name="profile">
          我的
        </Tabbar.Item>
      </Tabbar>
    </>

  );
}

export default App;