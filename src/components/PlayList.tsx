import React, { useState } from 'react';
import { PullRefresh, List } from 'react-vant';
import { FloatingPanel } from 'react-vant';
import MusicItem from './MusicItem.tsx';
import axios from 'axios';

const instance = axios.create({
    baseURL: "http://39.100.90.48:8809/api", // 设置基本URL
    timeout: 5000, // 设置超时时间
});

// 获取音乐列表的函数
async function getData() {
    try {
        const response = await instance.get("/musicList");
        return response.data;
    } catch (error) {
        console.error("Error fetching music list:", error);
        return []; // 返回空数组以防止出错
    }
}

const PlayList = ({ setCurrentSong }) => {
    const [list, setList] = useState<Array<{ title: string; artist: string; duration: string }>>([]);
    const [finished, setFinished] = useState<boolean>(false);

    // 切换歌曲
    const handleSongClick = (song) => {
        setCurrentSong(song);
    };

    // 刷新加载数据
    const onLoadRefresh = async (isRefresh?: boolean) => {
        const data = await getData();
        setList(v => {
            const newList = isRefresh ? data : [...v, ...data];
            setFinished(true);
            return newList;
        });
    };

    const onRefresh = async () => {
        setFinished(false);
        await onLoadRefresh(true);
    };

    return (
        <FloatingPanel anchors={[250, 320, window.innerHeight * 0.8]}>
            <PullRefresh onRefresh={onRefresh}>
                <List finished={finished} onLoad={onLoadRefresh}>
                    {list.map((obj, i) => (
                        <MusicItem key={i} item={obj} onSongClick={() => handleSongClick(obj)} />
                    ))}
                </List>
            </PullRefresh>
        </FloatingPanel>
    );
}

export default PlayList;
