import './App.css';
import PlayList from './components/PlayList.tsx';
import 'react-vant/es/styles';
import MusicPlayer from './components/MusicPlayer.tsx';
import React, { useState, useEffect } from 'react';
import { Image } from 'react-vant'
import axios from 'axios';

const instance = axios.create({
    baseURL: "http://39.100.90.48:8809/api",
    timeout: 5000,
});

function App() {
  const [currentSong, setCurrentSong] = useState({ title: "All For Love", artist: "Bryan Adams", duration: "5:20", url: "https://lx-sycdn.kuwo.cn/70f54e1f3f84b26a7b81fc6bd7791469/66f76e19/resource/n2/72/20/432496392.mp3", cover: "https://yup1.oss-cn-hangzhou.aliyuncs.com/images/images/3.png" });
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlist, setPlaylist] = useState([]);

  useEffect(() => {
    // 获取播放列表
    const fetchPlaylist = async () => {
      try {
        const response = await instance.get("/musicList");
        setPlaylist(response.data);
      } catch (error) {
        console.error("Error fetching music list:", error);
      }
    };
    fetchPlaylist();
  }, []);

  const handlePrevSong = () => {
    const currentIndex = playlist.findIndex(song => song.title === currentSong.title);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentSong(playlist[prevIndex]);
  };

  const handleNextSong = () => {
    const currentIndex = playlist.findIndex(song => song.title === currentSong.title);
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentSong(playlist[nextIndex]);
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="music-container">
          <Image src={currentSong.cover} className="App-logo" alt="logo" round fit="cover" />
          <MusicPlayer 
            currentSong={currentSong} 
            onTimeUpdate={(time) => setCurrentTime(time)}
            onDurationChange={(duration) => setDuration(duration)}
            onPrevSong={handlePrevSong}
            onNextSong={handleNextSong}
          />
        </div>
        <PlayList 
          setCurrentSong={setCurrentSong} 
          currentSong={currentSong}
          playlist={playlist}
        />
      </header>
    </div>
  );
}

export default App;
