import React, { useEffect, useState, useRef } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import './MusicPlayer.css';
import { Arrow, ArrowLeft, PauseCircle, PlayCircle, Bars, LikeO, Like, Music } from '@react-vant/icons';
import { Slider } from 'react-vant';
import { instance } from '../utils/api';
import { Toast } from 'react-vant/lib';
// 辅助函数：将秒数转换为 "分:秒" 格式
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const MusicPlayer = ({ currentSong, onPrevSong, onNextSong, onError, setIsShowPlayList, setCurrentSong, updateSongInPlaylist, likeList, setLikeList }) => {
  const [playingMusic, setPlayingMusic] = useState(currentSong);
  const [isPlaying, setIsPlaying] = useState(true);
  const playerRef = useRef<ReactAudioPlayer>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [sliderValue, setSliderValue] = useState(0);

  const handleLike = async (status) => {
    const updatedSong = { ...currentSong, likeState: status };
    setCurrentSong(updatedSong);
    if (status === 1) likeList.push(updatedSong);
    else if (status === 0) {
      const index = likeList.findIndex(song => song.id === updatedSong.id);
      likeList.splice(index, 1);
    }
    try {
      const response = await instance.post('/like', {
        id: updatedSong.id,
        likeState: status
      });
      Toast.success(response.data);

      // 更新播放列表中的歌曲状态
      updateSongInPlaylist(updatedSong);
    } catch (error) {
      console.error('发送喜欢状态时出错:', error);
      Toast.fail('更新喜欢状态失败');
    }
  };

  useEffect(() => {
    if (currentSong) {
      setPlayingMusic(currentSong);
      setIsPlaying(true);
      if (playerRef.current && playerRef.current.audioEl.current) {
        playerRef.current.audioEl.current.play();
      }
    }
  }, [currentSong]);


  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && playerRef.current.audioEl.current) {
        const audio = playerRef.current.audioEl.current;
        setCurrentTime(audio.currentTime);
        setSliderValue(audio.currentTime);
        if (audio.duration !== duration) {
          setDuration(audio.duration);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [playingMusic, duration]);

  const handleSliderChange = (value: number) => {
    setSliderValue(value);
  };

  const handleSliderAfterChange = (value: number) => {
    if (playerRef.current && playerRef.current.audioEl.current) {
      playerRef.current.audioEl.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const togglePlayPause = () => {
    if (playerRef.current && playerRef.current.audioEl.current) {
      if (isPlaying) {
        playerRef.current.audioEl.current.pause();
      } else {
        playerRef.current.audioEl.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }

  return (
    <div className="music-player">
      {playingMusic && (
        <>
          <div className="music-info">
            <h3 className="music-title">{playingMusic.title}</h3>
            <p className="music-artist">{playingMusic.artist}</p>
          </div>
          <div className="progress-bar">
            <Slider
              barHeight={4}
              activeColor="#ee0a24"
              value={sliderValue}
              min={0}
              max={duration}
              onChange={handleSliderChange}
              onChangeAfter={handleSliderAfterChange}
            />
            <div className="time-display">
              <span>{formatTime(sliderValue)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          <div className="player-controls">
            {currentSong.likeState === 1 ? <Like className="control-icon control-side" color={currentSong.likeState ? "red" : "inherit"} fontSize="2em" onClick={
              () => { handleLike(0) }

            } />
              : <LikeO className="control-icon control-side" color={currentSong.likeState ? "red" : "inherit"} fontSize="2em" onClick={
                () => { handleLike(1) }
              } />
            }
            <div className="main-controls">
              <ArrowLeft className="control-icon" fontSize="2em" onClick={onPrevSong} />
              {isPlaying ? (
                <PauseCircle className="control-icon play-pause" fontSize="2.5em" onClick={togglePlayPause} />
              ) : (
                <PlayCircle className="control-icon play-pause" fontSize="2.5em" color='#f44336' onClick={togglePlayPause} />
              )}
              <Arrow className="control-icon" color='#f44336' fontSize="2em" onClick={onNextSong} />
            </div>
            <Bars className="control-icon control-side" fontSize="2em" onClick={() => { setIsShowPlayList(true) }} />
          </div>
          <div className='music-player-wrapper'>
            <ReactAudioPlayer
              src={playingMusic.url}
              ref={playerRef}
              autoPlay={true}
              className="custom-audio-player"
              controlsList="nodownload"
              onLoadedMetadata={(e: Event) => {
                const target = e.target as HTMLAudioElement;
                setDuration(target.duration);
              }}
              onError={onError}
              onEnded={onNextSong}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default MusicPlayer;
