import React, { useEffect, useState } from "react";
import { instance } from '../utils/api';
import { Flex, Image, Typography, Button, Uploader, Input, Cell, Toast } from 'react-vant';
import './Discovery.css'; // 引入自定义样式
import { Like, LikeO, ShareO, AddO, Share } from "@react-vant/icons";
import { useSwipeable } from 'react-swipeable';

function Discovery({ userinfo }) {
    const [posts, setPosts] = useState([]);
    const [postIndex, setPostIndex] = useState(0);
    const [publistState, setPublishState] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [uploadedImages, setUploadedImages] = useState([]); // 保存上传的图片URL

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await instance.post("/posts");
            setPosts(prevPosts => [...prevPosts, ...res.data.datas]);
        } catch (err) {
            console.log(err);
        }
    };

    const handleClickLike = async (state) => {
        try {
            const res = await instance.post("/likePost", {
                id: posts[postIndex]?.id,
                isLike: state
            });
            if (res.data.code === 200) {
                // 更新点赞状态
                setPosts(prevPosts => 
                    prevPosts.map((post, index) =>
                        index === postIndex ? { ...post, isLike: state } : post
                    )
                );
            }
        } catch (error) {
            console.log('点赞失败', error);
        }
    };

    const handleSwipeUp = () => {
        if (postIndex < posts.length - 1) {
            setPostIndex(prevIndex => prevIndex + 1);
        } else {
            fetchPosts(); // 加载更多帖子
        }
    };

    const handleSwipeDown = () => {
        if (postIndex > 0) {
            setPostIndex(prevIndex => prevIndex - 1);
        }
    };

    const swipeHandlers = useSwipeable({
        onSwipedUp: handleSwipeUp,
        onSwipedDown: handleSwipeDown,
        preventScrollOnSwipe: true,
        trackMouse: true
    });

    const images = posts[postIndex]?.images || [];

    const upload = async (file) => {
        try {
            const formData = new FormData();
            const timestamp = Date.now();
            formData.append('file', file, timestamp + '.png');
            const response = await instance.post('/uploadFile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const imageUrl = response.data.data.url;
            setUploadedImages(prevImages => [...prevImages, imageUrl]); // 将上传的图片URL添加到列表中
            return response.data.data;
        } catch (error) {
            console.log(error);
            return { url: userinfo.cover };
        }
    };

    const handlePublish = async () => {
        try {
            const payload = {
                title,
                content,
                images: uploadedImages // 将上传的图片URL发送给服务器
            };
            const response = await instance.post('/publishPost', payload);
            if (response.data.code === 200) {
                setPublishState(false);
                setTitle('');
                setContent('');
                setUploadedImages([]); // 清空已上传的图片列表
                fetchPosts(); // 重新加载帖子列表
                Toast.success(response.data.message);
            }
        } catch (error) {
            console.log('发布失败', error);
        }
    };

    return (
        <>
            {!publistState && <div className="discovery-container" {...swipeHandlers}>
                <Button icon={<AddO />} type='default' onClick={() => { setPublishState(true) }} style={{ position: 'absolute', right: '3%' }} round>发帖子</Button>
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
                    {posts[postIndex]?.isLike ? (
                        <Like fontSize="3.5em" onClick={() => { handleClickLike(0) }} color="red" />
                    ) : (
                        <LikeO fontSize="3.5em" onClick={() => { handleClickLike(1) }} />
                    )}
                    <ShareO fontSize="3.5em" />
                </div>
            </div>}

            {publistState && <div className="discovery-publish-container">
                <Button icon={<Share />} onClick={handlePublish} style={{ position: "absolute", right: '3%', top: '2%', zIndex: 999 }} round type="danger">发布</Button>

                <div className="publish-content">
                    <Cell>
                        <Input
                            prefix="话题："
                            value={title}
                            onChange={setTitle}
                            placeholder='输入话题以逗号（,）分隔'
                            clearable
                        />
                    </Cell>
                    <Uploader uploadIcon={<AddO />} upload={upload} accept='*' maxCount={9} style={{ position: 'absolute', bottom: '10%', right: 0 }} />

                    <div>
                        <Cell>
                            内容：<Input.TextArea
                                placeholder="分享你的开心事....."
                                value={content}
                                onChange={setContent}
                                autoSize={{ minHeight: 500, maxHeight: 500 }}
                            />
                        </Cell>
                    </div>

                </div>
            </div>}
        </>
    );
}

export default Discovery;
