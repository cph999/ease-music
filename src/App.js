/* global chrome */

import './App.css';
import PlayList from './components/PlayList.tsx';
import 'react-vant/es/styles';
import MusicPlayer from './components/MusicPlayer.tsx';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Image, Toast, Search } from 'react-vant'
import axios from 'axios';

const instance = axios.create({
  // baseURL: "https://app102.acapp.acwing.com.cn/api",
  baseURL: "http://localhost:8809/api",

  timeout: 5000,
});

function App() {
  const [currentSong, setCurrentSong] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    // 获取播放列表
    const fetchPlaylist = async () => {
      try {
        const response = await instance.get("/musicList");
        setPlaylist(response.data);
        // 设置第一首歌为当前歌曲
        if (response.data.length > 0) {
          setCurrentSong(response.data[0]);
        }
      } catch (error) {
        console.error("Error fetching music list:", error);
        Toast.fail('获取播放列表失败，请稍后重试');
      }
    };
    fetchPlaylist();
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

  // 修改 isInChromeExtension 函数
  const isInChromeExtension = () => {
    return true; // 现在总是返回 true
    // return false;
  };

  const handleKeyDown = useCallback((event) => {
    if (event.ctrlKey && event.key === 'x') {
      event.preventDefault();
      setShowSearch(prevState => !prevState); // 切换搜索框的显示状态
      if (showSearch) {
        setSearch(''); // 如果正在隐藏搜索框，清空搜索内容
      }
    }
  }, [showSearch]);

  const handleClickOutside = useCallback((event) => {
    if (searchRef.current && !searchRef.current.contains(event.target)) {
      setShowSearch(false);
      setSearch('');
    }
  }, []);

  useEffect(() => {
    // 添加事件监听器
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    // 清理函数
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleKeyDown, handleClickOutside]);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  return (
    <div className={`App ${isInChromeExtension() ? 'chrome-extension' : ''}`}>
      <header className="App-header">
        {showSearch && (
          <div
            ref={searchRef}
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              right: '10px',
              zIndex: 1000
            }}
          >
            <Search
              ref={searchInputRef}
              style={{ width: '100%' }}
              value={search}
              onChange={setSearch}
              placeholder="请输入搜索关键词"
              showAction
              onSearch={async (val) => {
                const response = await instance.post("/search", { "title": val });
                if (response.data instanceof Array) {
                  // 设置第一首歌为当前歌曲
                  if (response.data.length > 0) {
                    setCurrentSong(response.data[0]);
                  }
                } else {
                  Toast.fail(response.data)
                }
              }}
              onCancel={() => {
                setShowSearch(false);
                setSearch('');
              }}
              onClear={() => {
                setSearch('');
              }}
            />
          </div>
        )}
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
              />
            </>
          )}
        </div>
        {!isInChromeExtension() && (
          <PlayList
            setCurrentSong={setCurrentSong}
            currentSong={currentSong}
            playlist={playlist}
            isInChromeExtension={isInChromeExtension}
          />
        )}
      </header>
    </div>
  );
}

export default App;
