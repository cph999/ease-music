/* global chrome */

import './App.css';
import PlayList from './components/PlayList.tsx';
import 'react-vant/es/styles';
import MusicPlayer from './components/MusicPlayer.tsx';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Image, Toast, Search } from 'react-vant'
import { instance } from './utils/api';
import tinggeshiqu from './assets/images/tinggeshiqu.png';
import tinggeshiqu40x40 from './assets/images/tinggeshiqu40x40.png';

// 添加获取 URL 参数的函数
function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function App() {
  const [currentSong, setCurrentSong] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const [isShowPlayList, setIsShowPlayList] = useState(false);
  const [sourceEnv, setSourceEnv] = useState(null);
  const playlistRef = useRef(null);

  useEffect(() => {
    const envParam = getParameterByName('sourceEnv');
    setSourceEnv(envParam);
    console.log('sourceEnv:', envParam);

    if (envParam) {
      switch (envParam) {
        case 'production':
          console.log('Running in production environment');
          break;
        case 'plugin':
          console.log('Running in development environment');
          break;
        default:
          console.log('Running in default environment');
      }
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

  const isInChromeExtension = () => {
    return sourceEnv === 'plugin'
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

  const handleClickOutside = useCallback((event) => {
    if (searchRef.current && !searchRef.current.contains(event.target)) {
      setShowSearch(false);
      setSearch('');
    }
    if (playlistRef.current && !playlistRef.current.contains(event.target) && isShowPlayList) {
      setIsShowPlayList(false);
    }
  }, [showSearch, isShowPlayList]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

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

  const updateSongInPlaylist = (updatedSong) => {
    setPlaylist(prevPlaylist =>
      prevPlaylist.map(song =>
        song.id === updatedSong.id ? updatedSong : song
      )
    );
  };

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
                setIsShowPlayList={setIsShowPlayList}
                setCurrentSong={setCurrentSong}
                updateSongInPlaylist={updateSongInPlaylist}
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
        </div>
      </header>
    </div>
  );
}

export default App;