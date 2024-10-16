import React, { useState, useEffect, useRef } from 'react';
import { instance } from '../utils/api';
import { Toast } from 'react-vant';
import { PullRefresh, List, Cell, Flex, Image, Badge } from 'react-vant';
import './Chat.css';
import defaultIcon from '../assets/images/3.png';
import ChatBox from './ChatBox.tsx';

function Chat({ userinfo }) {
    const [messages, setMessages] = useState([]); // 所有消息
    const [finish, setFinish] = useState(false);
    const [boxMessage, setBoxMessage] = useState([]); // 当前对话人的消息
    const [chatState, setChatState] = useState(false);
    const websocketRef = useRef(null);
    const boxMessageRef = useRef(boxMessage);

    // 同步boxMessage到boxMessageRef
    useEffect(() => {
        boxMessageRef.current = boxMessage;
    }, [boxMessage]);

    useEffect(() => {
        if (!userinfo || !userinfo.id) return;

        const ws = new WebSocket(`wss://app102.acapp.acwing.com.cn/chat?userId=${userinfo.id}`);
        // wss://app102.acapp.acwing.com.cn/chat?userId=49
        // const ws = new WebSocket(`ws://39.100.90.48:8809/chat?userId=${userinfo.id}`);
        // const ws = new WebSocket(`ws://localhost:8809/chat?userId=${userinfo.id}`);


        ws.onopen = () => {
            console.log('WebSocket connected');
        };

        ws.onmessage = (event) => {
            const newMessage = JSON.parse(event.data);
            let flag = false;

            setMessages((prevMessages) => {
                const updatedMessages = [...prevMessages]; // 创建新数组
                const currentBoxMessage = boxMessageRef.current; // 获取最新的boxMessage

                for (let i = 0; i < prevMessages.length; i++) {
                    if (
                        (prevMessages[i][0].fromId === newMessage.fromId || newMessage.fromId === prevMessages[i][0].toId) &&
                        (newMessage.toId === prevMessages[i][0].fromId || newMessage.toId === prevMessages[i][0].toId)
                    ) {
                        //新的消息应该放到这个对话中
                        updatedMessages[i] = [...updatedMessages[i], newMessage];

                        if (Array.isArray(currentBoxMessage) && currentBoxMessage.length > 0) {
                            const targetId = currentBoxMessage[0].fromId === userinfo.id ? currentBoxMessage[0].toId : currentBoxMessage[0].fromId;
                            if (newMessage.fromId === targetId || newMessage.toId === targetId) {
                                setBoxMessage(updatedMessages[i]); // 更新boxMessage
                            }
                        }
                        flag = true;
                    }
                }

                if (flag) return updatedMessages;
                else return prevMessages; // 返回原来的消息
            });
        };

        ws.onerror = (error) => {
            console.log('WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
        };

        websocketRef.current = ws;

        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, [userinfo]); // 仅依赖于userinfo

    const sendMessage = (message) => {
        if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
            websocketRef.current.send(JSON.stringify(message));
        } else {
            Toast.fail('WebSocket未连接');
        }
    };

    const handleClickMessage = (message) => {
        setBoxMessage((prevBoxMessage) => {
            return message;
        });
        setChatState(true);
    };

    const onLoadRefresh = async () => {
        if (!userinfo || JSON.stringify(userinfo) === '{}') {
            Toast.fail('请先登录');
            return;
        }
        try {
            const response = await instance.post("/messages");
            setMessages(response.data.datas);
            setFinish(true);
        } catch (error) {
            console.error("Error fetching chat records:", error);
            Toast.fail('获取聊天记录失败，请稍后重试');
        }
    };

    const onRefresh = async () => {
        setFinish(false);
        await onLoadRefresh();
    };

    return (
        <>
            {!chatState && (
                <div className='chat-box'>
                    <div className='chat-header'>
                        <Flex justify='start' align='center'>
                            <Flex.Item span={4} className="badge">
                                <Badge dot offset={['0%', '100%']} color="#87d068">
                                    <Image round fit='cover' width='100%' height='100%' src={(userinfo && userinfo.cover) || defaultIcon} />
                                </Badge>
                            </Flex.Item>
                            <Flex.Item span={8} className="nickname-container">
                                <span className="nickname">{userinfo.nickname}</span>
                            </Flex.Item>
                        </Flex>
                    </div>

                    <div className='list-container'>
                        <PullRefresh onRefresh={onRefresh}>
                            <List finished={finish} onLoad={onLoadRefresh}>
                                {messages.map((message, index) => (
                                    <Cell
                                        key={message[message.length - 1].id}
                                        title={userinfo.id === message[message.length - 1].fromId ? message[message.length - 1].toNickname : message[message.length - 1].fromNickname}
                                        label={message[message.length - 1].message}
                                        icon={<img src={userinfo.id === message[message.length - 1].fromId ? message[message.length - 1].toIcon : message[message.length - 1].fromIcon} alt="from" className="cell-icon" />}
                                        value={message[message.length - 1].showTime}
                                        className={userinfo.id === message[message.length - 1].fromId ? "cell-sent" : "cell-received"}
                                        onClick={() => handleClickMessage(message)}
                                    />
                                ))}
                            </List>
                        </PullRefresh>
                    </div>
                </div>
            )}

            {chatState && (
                <ChatBox
                    boxMessage={boxMessage}
                    setChatState={setChatState}
                    userinfo={userinfo}
                    sendMessage={sendMessage}
                />
            )}
        </>
    );
}

export default Chat;
