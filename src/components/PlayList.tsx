import React, { useState, useEffect } from 'react';
import { List } from 'react-vant';
import MusicItem from './MusicItem.tsx';
import './PlayList.css';
import { Cross } from '@react-vant/icons';

const PlayList = ({ setCurrentSong, currentSong, playlist, setIsShowPlayList, isShowPlayList }) => {
    const [finished, setFinished] = useState<boolean>(false);
    const [showPlaylist, setShowPlaylist] = useState(false);

    useEffect(() => {
        if (isShowPlayList) {
            setTimeout(() => setShowPlaylist(true), 50);
        } else {
            setShowPlaylist(false);
        }
    }, [isShowPlayList]);

    const handleSongClick = (song) => {
        setCurrentSong(song);
    };

    const onLoadRefresh = async () => {
        setFinished(true);
    };

    const handleClose = () => {
        setShowPlaylist(false);
        setTimeout(() => setIsShowPlayList(false), 300);
    };

    return (
        <div className={`playlist-container ${showPlaylist ? 'show' : ''}`}>
            <div className="playlist-header">
                <span className="playlist-title">Music List</span>
                <Cross className="playlist-close" color='#f44336' fontSize="24px" onClick={handleClose} />
            </div>
            <List finished={finished} onLoad={onLoadRefresh}>
                {playlist.map((obj, i) => (
                    <MusicItem
                        key={i}
                        item={obj}
                        onSongClick={() => handleSongClick(obj)}
                        isPlaying={currentSong && currentSong.title === obj.title}
                    />
                ))}
            </List>
        </div>
    );
}

export default PlayList;
