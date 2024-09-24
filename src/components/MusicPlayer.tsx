import React from 'react';
import ReactAudioPlayer from 'react-audio-player';
import rubia from '../assets/audio/Rubia.mp3';  // 从 src 目录中导入音频文件
import './MusicPlayer.css';

const MusicPlayer = ({name}) => {
  return (
    <div className='music-player-wrapper'>
      <h3>{name}</h3>
      <ReactAudioPlayer
        src={rubia}  // 使用导入的音频文件
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
