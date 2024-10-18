import '../App.css';
import PlayList from './PlayList.tsx';
import 'react-vant/es/styles';
import MusicPlayer from './MusicPlayer.tsx';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { instance } from '../utils/api';
import HomeHeader from './HomeHeader.tsx';
import LocalStorageUtil from '../utils/LocalStorageUtil';
import { Image, Toast, Tabbar } from 'react-vant';
import { FriendsO, HomeO, Search, SettingO } from '@react-vant/icons'

function Home({ userinfo, setUserinfo }) {
    const [currentSong, setCurrentSong] = useState(null);
    const [playlist, setPlaylist] = useState([]);
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [loginState, setLoginState] = useState(false);
    const [isShowPlayList, setIsShowPlayList] = useState(false);
    const playlistRef = useRef(null);
    const [list, setList] = useState([])
    const [activeTab, setActiveTab] = useState('home');

    const fetchPlaylist = async () => {
        try {
            const response = await instance.get("/musicList");
            setPlaylist(response.data);
            if (response.data.length > 0) {
                setCurrentSong(response.data[0]);
            }
        } catch (error) {
            console.error("Error fetching music list:", error);
            Toast.fail('获取播放列表失败，请稍后重试');
        }
    };

    useEffect(() => {
        if (LocalStorageUtil.getItem('userinfo') === null || JSON.stringify(LocalStorageUtil.getItem('userinfo')) === '{}') {
            // Toast.fail('请先登录');
            setLoginState(false);
        } else {
            setLoginState(true);
            fetchPlaylist();
        }
    }, [userinfo]);

    const handlePrevSong = () => {
        if (playlist.length === 0) {
            Toast.info('播放列表为空');
            return;
        }
        const currentIndex = playlist.findIndex(song => song.title === currentSong.title);
        const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
        setCurrentSong(playlist[prevIndex]);
    };

    const handleNextSong = () => {
        if (playlist.length === 0) {
            Toast.info('播放列表为空');
            return;
        }
        const currentIndex = playlist.findIndex(song => song.title === currentSong.title);
        const nextIndex = (currentIndex + 1) % playlist.length;
        setCurrentSong(playlist[nextIndex]);
    };

    const handleError = (error) => {
        console.error("Error playing song:", error);
        Toast.fail(currentSong.title + ' 播放出错，请稍后重试');
    };

    const handleKeyDown = useCallback((event) => {
        if (event.ctrlKey && event.key === 'x') {
            event.preventDefault();
            setShowSearch(prevState => !prevState);
            if (showSearch) {
                setSearch('');
            }
        }
    }, [showSearch]);



    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);


    const updateSongInPlaylist = (updatedSong) => {
        setPlaylist(prevPlaylist =>
            prevPlaylist.map(song =>
                song.id === updatedSong.id ? updatedSong : song
            )
        );
    };

    return (
        <div className="App">
            <header className="App-header">
            {loginState && <HomeHeader setCurrentSong={setCurrentSong} search={search} setSearch={setSearch} userinfo={userinfo} list={list} setList={setList} />}


                <div className="music-container">
                    {currentSong && (
                        <>
                            <div className="image-container">
                                <Image
                                    src={currentSong.cover}
                                    className="App-logo"
                                    alt="logo"
                                    round
                                    fit="cover"
                                    width="100%"
                                    height="100%"
                                />
                            </div>
                            <MusicPlayer
                                currentSong={currentSong}
                                onPrevSong={handlePrevSong}
                                onNextSong={handleNextSong}
                                onError={handleError}
                                setIsShowPlayList={setIsShowPlayList}
                                setCurrentSong={setCurrentSong}
                                updateSongInPlaylist={updateSongInPlaylist}
                                likeList={list}
                                setLikeList={setList}
                            />
                            {isShowPlayList && (
                                <div ref={playlistRef}>
                                    <PlayList
                                        setCurrentSong={setCurrentSong}
                                        currentSong={currentSong}
                                        playlist={playlist}
                                        setIsShowPlayList={setIsShowPlayList}
                                        isShowPlayList={isShowPlayList}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </header>
        </div>
    );

}

export default Home;