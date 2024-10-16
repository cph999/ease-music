import React, { useEffect, useState } from "react";
import { instance } from '../utils/api';
import { Flex, Image, Typography } from 'react-vant';
import './Discovery.css'; // 引入自定义样式
import { Like, LikeO, ShareO } from "@react-vant/icons";
import { useSwipeable } from 'react-swipeable';

function Discovery() {
    const [posts, setPosts] = useState([]);
    const [postIndex, setPostIndex] = useState(0);
    const [likeState, setLikeState] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    useEffect(() => {
        if (posts.length > 0) {
            setLikeState(posts[postIndex]?.isLike);
        }
    }, [postIndex, posts]);

    const fetchPosts = async () => {
        try {
            const res = await instance.post("/posts");
            setPosts(prevPosts => [...prevPosts, ...res.data.datas]);
        } catch (err) {
            console.log(err);
        }
    };

    const handleClickLike = async (state) => {
        const res = await instance.post("/likePost", {
            id: posts[postIndex]?.id,
            isLike: state
        });
        setLikeState(state);
    };

    const handleSwipeUp = () => {
        console.log("handleSwipeUp")
        if (postIndex < posts.length - 1) {
            setPostIndex(prevIndex => prevIndex + 1);
        } else {
            fetchPosts(); // 加载更多帖子
        }
    };

    const handleSwipeDown = () => {
        console.log("handleSwipeDown")
        if (postIndex > 0) {
            setPostIndex(prevIndex => prevIndex - 1);
        }
    };

    const swipeHandlers = useSwipeable({
        onSwipedUp: handleSwipeUp,
        onSwipedDown: handleSwipeDown,
        preventScrollOnSwipe: true,
        trackMouse: true // 允许在电脑上用鼠标拖动测试
    });

    const images = posts[postIndex]?.images || [];

    return (
        <div className="discovery-container" {...swipeHandlers}>
            <div className="main-content-container">
                <Typography.Text className="post-content">
                    {posts[postIndex]?.content}
                </Typography.Text>

                {images.length === 1 ? (
                    <Image
                        src={images[0]}
                        className="single-image"
                        fit="cover"
                        width="100%"
                        height="100%"
                    />
                ) : images.length > 1 ? (
                    <Flex wrap="wrap" className="image-grid">
                        {images.map((image, idx) => (
                            <Image
                                key={idx}
                                src={image}
                                className={`grid-image grid-image-${images.length}`}
                                fit="cover"
                            />
                        ))}
                    </Flex>
                ) : null}
            </div>


            <div className="right-operate-container">
                <Image
                    src={posts[postIndex]?.userIcon}
                    width='80%'
                    height='80%'
                    round
                    fit="cover"
                />
                {likeState ? (
                    <Like fontSize="3.5em" onClick={() => { handleClickLike(0) }} color="red" />
                ) : (
                    <LikeO fontSize="3.5em" onClick={() => { handleClickLike(1) }} />
                )}
                <ShareO fontSize="3.5em" />
            </div>
        </div>
    );
}

export default Discovery;
