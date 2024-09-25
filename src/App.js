import './App.css';
import PlayList from './components/PlayList.tsx';
import 'react-vant/es/styles';
import MusicPlayer from './components/MusicPlayer.tsx';
import React, { useState } from 'react';
import { Flex, Image } from 'react-vant'

function App() {
  const [currentSong, setCurrentSong] = useState({ title: "All For Love", artist: "Bryan Adams", duration: "5:20", url: "https://webfs.kugou.com/202409241930/d501274a562bde98e8118f53541369c9/v3/4a26f2fdda5e049493bfb7a1c58b6f07/yp/full/ap1014_us0_mii0w1iw8z2ai2iphcu80ooo2ki81120_pi406_mx574948317_s2517498387.mp3", cover: "https://yup1.oss-cn-hangzhou.aliyuncs.com/images/images/3.png" }); // 管理当前播放的歌曲

  return (
    <div className="App">
      <header className="App-header">
        <Image src={currentSong.cover} className="App-logo" alt="logo" round fit="cover" />
        <MusicPlayer currentSong={currentSong} />
        <PlayList setCurrentSong={setCurrentSong} />
      </header>
    </div>
  );
}

export default App;
