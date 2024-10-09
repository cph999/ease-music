/* global chrome */

import './App.css';
import PlayList from './components/PlayList.tsx';
import 'react-vant/es/styles';
import MusicPlayer from './components/MusicPlayer.tsx';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Image, Toast, Search, Loading, Space } from 'react-vant'
import { instance } from './utils/api';
import { Music, MusicO, Close, createFromIconfontCN } from '@react-vant/icons';
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

// 添加以下辅助函数
function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function floatTo16BitPCM(output, offset, input) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

function writeAudioBufferToWav(audioBuffer, numChannels, sampleRate) {
  const buffer = new ArrayBuffer(44 + audioBuffer.length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + audioBuffer.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, audioBuffer.length * 2, true);

  floatTo16BitPCM(view, 44, audioBuffer);

  return new Blob([view], { type: 'audio/wav' });
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
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const [audioInput, setAudioInput] = useState(null);
  const [recorder, setRecorder] = useState(null);

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
  const stopRecording = async () => {
    if (audioContext && audioInput && recorder && mediaRecorder && isRecording) {
      setIsRecording(false); // 立即设置为非录音状态

      if (mediaRecorder.stream) {
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }

      recorder.disconnect();
      audioInput.disconnect();

      if (audioContext.state !== 'closed') {
        await audioContext.close();
      }

      const audioData = mediaRecorder.audioChunks.reduce((acc, chunk) => {
        return new Float32Array([...acc, ...chunk]);
      }, new Float32Array());

      const wavBlob = writeAudioBufferToWav(audioData, 1, audioContext.sampleRate);

      setAudioContext(null);
      setAudioInput(null);
      setRecorder(null);
      setMediaRecorder(null);

      Toast.success('识别中...');

      await sendAudioToBackend(wavBlob);
    }
  };

  const startRecording = useCallback(async () => {
    if (isRecording) {
      await stopRecording();
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const source = context.createMediaStreamSource(stream);
      const node = context.createScriptProcessor(4096, 1, 1);

      let audioChunks = [];

      node.onaudioprocess = (e) => {
        const inputBuffer = e.inputBuffer;
        const channelData = inputBuffer.getChannelData(0);
        audioChunks.push(new Float32Array(channelData));
      };

      source.connect(node);
      node.connect(context.destination);

      setAudioContext(context);
      setAudioInput(source);
      setRecorder(node);
      setMediaRecorder({ audioChunks, stream });
      setIsRecording(true);

      // Toast.success('开始录音');
    } catch (error) {
      console.error('录音失败:', error);
      Toast.fail('无法访问麦克风');
    }
  }, [isRecording, stopRecording]);

  const sendAudioToBackend = async (audioBlob) => {
    try {
      const formData = new FormData();
      const timestamp = Date.now();
      formData.append('audio', audioBlob, `recording_${timestamp}.wav`);

      const response = await instance.post('/uploadAudio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Toast.success({
        message: "识别结果：《" + response.data.title + "》，" + response.data.artist,
        duration: 5000 // 设置持续时间为 5000 毫秒（5 秒）
      });

    } catch (error) {
      console.error('音频上传失败:', error);
      Toast.fail({
        message: '音频上传失败',
        duration: 5000 // 错误消息也设置为 5 秒
      });
    }
  };

  useEffect(() => {
    return () => {
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
      if (audioInput) {
        audioInput.disconnect();
      }
      if (recorder) {
        recorder.disconnect();
      }
      if (mediaRecorder && mediaRecorder.stream) {
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [audioContext, audioInput, recorder, mediaRecorder]);

  // useEffect(() => {
  //   return () => {
  //     // 组件卸载时的清理函数
  //     if (isRecording) {
  //       stopRecording();
  //     }
  //   };
  // }, [isRecording, stopRecording]);

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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          marginTop: '20px'
        }}>
          {isRecording ? (
            <Image
              width='120px'
              height='120px'
              src={tinggeshiqu}
              onClick={stopRecording}
            />
          ) : (
            <>
              <span style={{
                marginTop: '10px',
                fontSize: '20px',
                color: '#880081',
                fontWeight: '500',
                letterSpacing: '1px',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>
                听歌识曲
              </span>
              <Image
                width='80px'
                height='80px'
                src={tinggeshiqu40x40}
                onClick={startRecording}
                alt="听歌识曲"
              />
            </>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;