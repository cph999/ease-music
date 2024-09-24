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
                { title: "十年", artist: "陈奕迅", duration: "4:12" },
                { title: "告白气球", artist: "周杰伦", duration: "3:35" },
                { title: "演员", artist: "薛之谦", duration: "4:13" },
                { title: "突然好想你", artist: "五月天", duration: "5:20" },
                { title: "稻香", artist: "周杰伦", duration: "3:43" },
                { title: "小幸运", artist: "田馥甄", duration: "4:25" },
                { title: "匆匆那年", artist: "王菲", duration: "4:40" },
                { title: "说好不哭", artist: "周杰伦", duration: "3:45" },
                { title: "平凡之路", artist: "朴树", duration: "5:02" },
                { title: "光年之外", artist: "邓紫棋", duration: "4:23" }
            ];

            resolve(songs); // 返回包含歌曲名、歌手和时长信息的对象数组
        }, 2000);
    });
}

const PlayList = () => {
    // 将 list 的类型定义为歌曲对象数组
    const [list, setList] = useState<Array<{ title: string; artist: string; duration: string }>>([]);
    const [finished, setFinished] = useState<boolean>(false);

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
        <PullRefresh onRefresh={onRefresh}>
            <List finished={finished} onLoad={onLoadRefresh}>
                {list.map((obj, i) => (
                    <MusicItem key={i} item={obj} />
                ))}
            </List>
        </PullRefresh>
    );
}

export default () => (
    <FloatingPanel anchors={[50, 320, window.innerHeight * 0.8]}>
        <PlayList />
    </FloatingPanel>
);
