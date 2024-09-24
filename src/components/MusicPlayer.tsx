import React, { useEffect, useRef, useState } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import './MusicPlayer.css';

const MusicPlayer = ({ currentSong }) => {
  const audioRef = useRef(null);
  const [playingMusic, setPlayingMusic] = useState(currentSong);
  useEffect(() => {
    if (currentSong) {
      console.log("currentSong", currentSong);
      setPlayingMusic(currentSong);
    }
  }, [currentSong]); // 当 currentSong 改变时，更新播放器

  return (
    <div className='music-player-wrapper'>
      <h3>{playingMusic.name}</h3>
      <ReactAudioPlayer
        src={playingMusic.url}  // 使用导入的音频文件
        ref={audioRef}
        controls
        autoPlay={true}
        loop={true}
        className="custom-audio-player"
        controlsList="nodownload"
      />
    </div>
  );
};

export default MusicPlayer;
