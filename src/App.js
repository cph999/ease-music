/* global chrome */

import './App.css';
import PlayList from './components/PlayList.tsx';
import 'react-vant/es/styles';
import MusicPlayer from './components/MusicPlayer.tsx';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Image, Toast } from 'react-vant'
import { instance } from './utils/api';
import HomeHeader from './components/HomeHeader.tsx';
import LocalStorageUtil from './utils/LocalStorageUtil';
import { Card, Button, Overlay, Input, Form, Tabbar } from 'react-vant';
import { FriendsO, HomeO, Search, SettingO } from '@react-vant/icons'

function App() {
  const [currentSong, setCurrentSong] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isShowPlayList, setIsShowPlayList] = useState(false);
  const playlistRef = useRef(null);
  const [userinfo, setUserinfo] = useState({}); // 定义一个 state 变量存储用户名
  const [loginState, setLoginState] = useState(false); // 定义一个 state 变量存储用户名
  const [form] = Form.useForm()
  const [loginOrRegister, setLoginOrRegister] = useState('login');
  const [list, setList] = useState([])
  const [activeTab, setActiveTab] = useState('home');

  const onFinish = values => {
    console.log(values)
  }
  const fetchPlaylist = async () => {
    try {
      const response = await instance.get("/musicList");
      setPlaylist(response.data);
      if (response.data.length > 0) {
        setCurrentSong(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching music list:", error);
      Toast.fail('获取播放列表失败，请稍后重试');
    }
  };

  useEffect(() => {
    setUserinfo(LocalStorageUtil.getItem('userinfo')); //异步的
    if (LocalStorageUtil.getItem('userinfo') === null || JSON.stringify(LocalStorageUtil.getItem('userinfo')) === '{}') {
      Toast.fail('请先登录');
      setLoginState(false);
    } else {
      setLoginState(true);
      fetchPlaylist();
    }
  }, []);

  const handlePrevSong = () => {
    if (playlist.length === 0) {
      Toast.info('播放列表为空');
      return;
    }
    const currentIndex = playlist.findIndex(song => song.title === currentSong.title);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentSong(playlist[prevIndex]);
  };

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
      fetchPlaylist();
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

  const handleNextSong = () => {
    if (playlist.length === 0) {
      Toast.info('播放列表为空');
      return;
    }
    const currentIndex = playlist.findIndex(song => song.title === currentSong.title);
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentSong(playlist[nextIndex]);
  };

  const handleError = (error) => {
    console.error("Error playing song:", error);
    Toast.fail(currentSong.title + ' 播放出错，请稍后重试');
  };

  const handleKeyDown = useCallback((event) => {
    if (event.ctrlKey && event.key === 'x') {
      event.preventDefault();
      setShowSearch(prevState => !prevState);
      if (showSearch) {
        setSearch('');
      }
    }
  }, [showSearch]);



  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);


  const updateSongInPlaylist = (updatedSong) => {
    setPlaylist(prevPlaylist =>
      prevPlaylist.map(song =>
        song.id === updatedSong.id ? updatedSong : song
      )
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <HomeHeader setCurrentSong={setCurrentSong} search={search} setSearch={setSearch} userinfo={userinfo} list={list} setList={setList} />

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


        <div className="music-container">
          {currentSong && (
            <>
              <div className="image-container">
                <Image
                  src={currentSong.cover}
                  className="App-logo"
                  alt="logo"
                  round
                  fit="cover"
                  width="100%"
                  height="100%"
                />
              </div>
              <MusicPlayer
                currentSong={currentSong}
                onPrevSong={handlePrevSong}
                onNextSong={handleNextSong}
                onError={handleError}
                setIsShowPlayList={setIsShowPlayList}
                setCurrentSong={setCurrentSong}
                updateSongInPlaylist={updateSongInPlaylist}
                likeList={list}
                setLikeList={setList}
              />
              {isShowPlayList && (
                <div ref={playlistRef}>
                  <PlayList
                    setCurrentSong={setCurrentSong}
                    currentSong={currentSong}
                    playlist={playlist}
                    setIsShowPlayList={setIsShowPlayList}
                    isShowPlayList={isShowPlayList}
                  />
                </div>
              )}
            </>
          )}

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
        </div>
      </header>
    </div>
  );
}

export default App;