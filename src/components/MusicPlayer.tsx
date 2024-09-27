import React, { useEffect, useState, useRef } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import './MusicPlayer.css';
import { Arrow, ArrowLeft, PauseCircle, PlayCircle } from '@react-vant/icons';
import { Slider, Toast } from 'react-vant';

const MusicPlayer = ({ currentSong }) => {
  const [playingMusic, setPlayingMusic] = useState(currentSong);
  const [playState, setPlayState] = useState(true);
  const playerRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (currentSong) {
      setPlayingMusic(currentSong);
    }
  }, [currentSong]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current) {
        const audio = playerRef.current.audioEl.current;
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [playingMusic]);

  const handleSliderChange = (value) => {
    if (playerRef.current) {
      playerRef.current.audioEl.current.currentTime = value;
      setCurrentTime(value); // 更新当前时间
    }
  };

  const togglePlayPause = () => {
    setPlayState(!playState);
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
          {/* 进度条位置 */}
          <div style={{ width: '90%', margin: '30px auto' }}>
            <Slider
              barHeight={4}
              activeColor="#ee0a24"
              value={currentTime} // 使用 currentTime 作为 Slider 的值
              min={0}
              max={duration}
              onChange={handleSliderChange}
              onChangeAfter={(v) => Toast.info(`当前值：${v}`)}
            />
          </div>
          <div className='music-player-wrapper'>
            <ReactAudioPlayer
              src={playingMusic.url}
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
