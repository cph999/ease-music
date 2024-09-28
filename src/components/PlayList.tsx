import React, { useState } from 'react';
import { PullRefresh, List } from 'react-vant';
import { FloatingPanel } from 'react-vant';
import MusicItem from './MusicItem.tsx';
import './PlayList.css'; // 新增这一行

const PlayList = ({ setCurrentSong, currentSong, playlist }) => {
    const [finished, setFinished] = useState<boolean>(false);

    const handleSongClick = (song) => {
        setCurrentSong(song);
    };

    const onLoadRefresh = async () => {
        setFinished(true);
    };

    const onRefresh = async () => {
        setFinished(false);
        await onLoadRefresh();
    };

    return (
        <FloatingPanel 
            anchors={[100, 200, window.innerHeight * 0.7]} 
        >
            <div className="playlist-container">
                <PullRefresh onRefresh={onRefresh}>
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
                </PullRefresh>
            </div>
        </FloatingPanel>
    );
}

export default PlayList;
