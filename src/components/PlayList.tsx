import React, { useState } from 'react'
import { PullRefresh, List } from 'react-vant'
import { FloatingPanel } from 'react-vant'
import MusicItem from './MusicItem.tsx';

async function getData(throwError?: boolean) {
    return new Promise<{ title: string; artist: string; duration: string }[]>((resolve, reject) => {
        setTimeout(() => {
            if (throwError) {
                reject(new Error('error'));
            }

            const songs = [
                { title: "十年", artist: "陈奕迅", duration: "4:12", url: "https://yup1.oss-cn-hangzhou.aliyuncs.com/audio/Rubia.mp3", cover: "https://yup1.oss-cn-hangzhou.aliyuncs.com/images/images/0.png" },
                { title: "告白气球", artist: "周杰伦", duration: "3:35", url: "https://yup1.oss-cn-hangzhou.aliyuncs.com/audio/DaoX.mp3", cover: "https://yup1.oss-cn-hangzhou.aliyuncs.com/images/images/8.png" },
                { title: "演员", artist: "薛之谦", duration: "4:13", url: "https://yup1.oss-cn-hangzhou.aliyuncs.com/audio/DaoX.mp3", cover: "https://yup1.oss-cn-hangzhou.aliyuncs.com/images/images/9.png" },
                { title: "突然好想你", artist: "五月天", duration: "5:20", url: "https://yup1.oss-cn-hangzhou.aliyuncs.com/audio/Rubia.mp3", cover: "https://yup1.oss-cn-hangzhou.aliyuncs.com/images/images/3.png" },
                { title: "稻香", artist: "周杰伦", duration: "3:43", url: "https://yup1.oss-cn-hangzhou.aliyuncs.com/audio/Rubia.mp3", cover: "https://yup1.oss-cn-hangzhou.aliyuncs.com/images/images/4.png" },
                { title: "小幸运", artist: "田馥甄", duration: "4:25", url: "https://yup1.oss-cn-hangzhou.aliyuncs.com/audio/Rubia.mp3", cover: "https://yup1.oss-cn-hangzhou.aliyuncs.com/images/images/5.png" },
                { title: "匆匆那年", artist: "王菲", duration: "4:40", url: "https://yup1.oss-cn-hangzhou.aliyuncs.com/audio/Rubia.mp3", cover: "https://yup1.oss-cn-hangzhou.aliyuncs.com/images/images/6.png" },
                { title: "说好不哭", artist: "周杰伦", duration: "3:45", url: "https://yup1.oss-cn-hangzhou.aliyuncs.com/audio/Rubia.mp3", cover: "https://yup1.oss-cn-hangzhou.aliyuncs.com/images/images/7.png" },
                { title: "平凡之路", artist: "朴树", duration: "5:02", url: "https://yup1.oss-cn-hangzhou.aliyuncs.com/audio/Rubia.mp3", cover: "https://yup1.oss-cn-hangzhou.aliyuncs.com/images/images/8.png" },
                { title: "光年之外", artist: "邓紫棋", duration: "4:23", url: "https://yup1.oss-cn-hangzhou.aliyuncs.com/audio/Rubia.mp3", cover: "https://yup1.oss-cn-hangzhou.aliyuncs.com/images/images/9.png" }
            ];

            resolve(songs); // 返回包含歌曲名、歌手和时长信息的对象数组
        }, 2000);
    });
}

const PlayList = ({ setCurrentSong }) => {

    // 将 list 的类型定义为歌曲对象数组
    const [list, setList] = useState<Array<{ title: string; artist: string; duration: string }>>([]);
    const [finished, setFinished] = useState<boolean>(false);
    // 切换歌曲
    const handleSongClick = (song) => {
        setCurrentSong(song); // 更新当前歌曲
    };

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
        await onLoadRefresh(true);  // 传递 true 来指示是刷新操作
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
        </FloatingPanel >
    );
}

export default PlayList;