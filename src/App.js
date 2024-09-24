import './App.css';
import PlayList from './components/PlayList.tsx';
import 'react-vant/es/styles';
import MusicPlayer from './components/MusicPlayer.tsx';
import React, { useState } from 'react';
import { Flex, Image } from 'react-vant'

function App() {
  const [currentSong, setCurrentSong] = useState( { title: "突然好想你", artist: "五月天", duration: "5:20", url: "https://yup1.oss-cn-hangzhou.aliyuncs.com/audio/Rubia.mp3", cover: "https://yup1.oss-cn-hangzhou.aliyuncs.com/images/images/3.png" }); // 管理当前播放的歌曲

  return (
    <div className="App">
      <header className="App-header">
        <Image src={currentSong.cover} className="App-logo" alt="logo" round  fit="cover" />
        <MusicPlayer currentSong={currentSong} />
        <PlayList setCurrentSong={setCurrentSong} />
      </header>
    </div>
  );
}

export default App;
