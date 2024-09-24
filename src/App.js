import logo from './logo.svg';
import './App.css';
import PlayList from './components/PlayList.tsx';
import 'react-vant/es/styles';
import MusicPlayer from './components/MusicPlayer.tsx';
import React, { useState } from 'react';

function App() {
  const [currentSong, setCurrentSong] = useState({name:"Rubia VB"}); // 管理当前播放的歌曲

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <MusicPlayer currentSong={currentSong} />
        <PlayList setCurrentSong={setCurrentSong} />
      </header>
    </div>
  );
}

export default App;
