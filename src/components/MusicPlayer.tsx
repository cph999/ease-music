import React, { useEffect, useState, useRef } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import './MusicPlayer.css';
import { Arrow, ArrowLeft, PauseCircle, PlayCircle } from '@react-vant/icons';

async function cacheAudio(currentSong) {
  const response = await fetch(currentSong.url);
  const blob = await response.blob();
  const reader = new FileReader();

  reader.onloadend = () => {
    localStorage.setItem(currentSong.title, reader.result); // 将音频文件存储为 Base64 字符串
  };
  reader.readAsDataURL(blob);
}

const MusicPlayer = ({ currentSong }) => {
  const [playingMusic, setPlayingMusic] = useState(currentSong);
  const [playState, setPlayState] = useState(true);
  const playerRef = useRef(null);

  useEffect(() => {
    if (currentSong) {
      console.log("currentSong", currentSong);
      setPlayingMusic(currentSong);
      
      // 检查缓存
      const cachedAudio = localStorage.getItem(currentSong.url);
      if (!cachedAudio) {
        cacheAudio(currentSong); // 如果没有缓存，则下载并缓存
      }
    }
  }, [currentSong]);

  const togglePlayPause = () => {
    setPlayState(!playState);
    console.log("playState", playState)
    if (playState) {
      playerRef.current.audioEl.current.play();
    }
    else {
      playerRef.current.audioEl.current.pause();
    }
  }

  return (
    <div>
      {playingMusic && (
        <>
          <h3>{playingMusic.title}</h3>
          <h3>{playingMusic.artist}</h3>
          <div className="icon-area">
            <ArrowLeft fontSize="2em" />
            {playState ? (
              <PlayCircle fontSize="2em" onClick={togglePlayPause} />
            ) : (
              <PauseCircle fontSize="2em" color='#f44336' onClick={togglePlayPause} />
            )}
            <Arrow color='#f44336' fontSize="2em" />
          </div>
          <div className='music-player-wrapper'>
            <ReactAudioPlayer
               src={localStorage.getItem(playingMusic.url) || playingMusic.url}
              ref={playerRef}
              controls
              autoPlay={true}
              loop={true}
              className="custom-audio-player"
              controlsList="nodownload"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default MusicPlayer;
