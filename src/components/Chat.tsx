import React, { useState, useEffect, useRef } from 'react';
import { instance } from '../utils/api';
import { Toast } from 'react-vant';
import { PullRefresh, List, Cell, Flex, Image, Badge, Popover, Search, NavBar, Button } from 'react-vant';
import './Chat.css';
import defaultIcon from '../assets/images/3.png';
import ChatBox from './ChatBox.tsx';
import { AddO } from '@react-vant/icons';
function Chat({ userinfo }) {
    const [messages, setMessages] = useState([]); // 所有消息
    const [finish, setFinish] = useState(false);
    const [boxMessage, setBoxMessage] = useState([]); // 当前对话人的消息
    const [chatState, setChatState] = useState(false);
    const websocketRef = useRef(null);
    const boxMessageRef = useRef(boxMessage);
    const [addFriendState, setAddFriendState] = useState(false);
    const [userList, setUserList] = useState([]);
    const [search, setSearch] = useState('');
    const [addFriendText, setAddFriendText] = useState('添加好友');


    // 同步boxMessage到boxMessageRef
    useEffect(() => {
        boxMessageRef.current = boxMessage;
    }, [boxMessage]);


    useEffect(() => {
        if (!userinfo || !userinfo.id) return;

        const fetchData = async () => {
            try {
                const response = await instance.post("/searchUser", { nickname: search, username: search });
                if (response && response.data && response.data.code === 200) {
                    setUserList(response.data.datas);
                } else {
                    Toast.fail("查询出错");
                }
            } catch (error) {
                console.error("Error fetching chat records:", error);
                Toast.fail('获取聊天记录失败，请稍后重试');
            }
        };

        fetchData();

        // const ws = new WebSocket(`wss://app102.acapp.acwing.com.cn/chat?userId=${userinfo.id}`);
        const ws = new WebSocket(`ws://localhost:8809/chat?userId=${userinfo.id}`);

        ws.onopen = () => {
            console.log('WebSocket connected');
        };

        ws.onmessage = (event) => {
            const newMessage = JSON.parse(event.data);
            let flag = false;

            setMessages((prevMessages) => {
                const updatedMessages = [...prevMessages];
                const currentBoxMessage = boxMessageRef.current;

                for (let i = 0; i < prevMessages.length; i++) {
                    if (
                        (prevMessages[i][0].fromId === newMessage.fromId || newMessage.fromId === prevMessages[i][0].toId) &&
                        (newMessage.toId === prevMessages[i][0].fromId || newMessage.toId === prevMessages[i][0].toId)
                    ) {
                        updatedMessages[i] = [...updatedMessages[i], newMessage];

                        if (Array.isArray(currentBoxMessage) && currentBoxMessage.length > 0) {
                            const targetId = currentBoxMessage[0].fromId === userinfo.id ? currentBoxMessage[0].toId : currentBoxMessage[0].fromId;
                            if (newMessage.fromId === targetId || newMessage.toId === targetId) {
                                setBoxMessage(updatedMessages[i]);
                            }
                        }
                        flag = true;
                    }
                }

                return flag ? updatedMessages : prevMessages;
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

    const disabledActions = [
        { text: '添加好友', disabled: false },
        { text: '敬请期待', disabled: true },
        { text: '敬请期待', disabled: true },
    ]

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

    const handleAddFtiend = async (user) => {
        instance.post("/addFriend", { fromId: userinfo.id, toId: user.id, fromNickname: userinfo.nickname, toNickname: user.nickname || user.username, fromIcon: userinfo.cover, toIcon: user.cover, message: "我们已经是好友了，开始聊天吧！" }).then(res => {
            if (res.data.code === 200) {
                Toast.success(res.data.message)
            } else {
                Toast.fail(res.data.message)
            }
        })
    };

    const select = (option) => {
        console.log(option)
        if (option.text === "添加好友")
            setAddFriendState(true);
    }

    const handleSearch = async () => {
        try {
            const response = await instance.post("/searchUser", { nickname: search, username: search });
            if (response && response.data && response.data.code === 200) {
                setUserList(response.data.datas)
            } else {
                Toast.fail("查询出错")
            }
        } catch (error) {
            console.error("Error fetching chat records:", error);
            Toast.fail('获取聊天记录失败，请稍后重试');
        }
    }


    return (
        <>
            {!chatState && !addFriendState && (
                <div className='chat-box'>
                    <div className='chat-header'>
                        <Flex justify='space-between' align='center'>
                            <Flex.Item span={4} className="badge">
                                <Badge dot offset={['0%', '100%']} color="#87d068">
                                    <Image round fit='cover' width='100%' height='100%' src={(userinfo && userinfo.cover) || defaultIcon} />
                                </Badge>
                            </Flex.Item>
                            <Flex.Item span={8} className="nickname-container">
                                <span className="nickname">{userinfo.nickname}</span>
                            </Flex.Item>
                            <Flex.Item span={12} style={{ textAlign: 'right', marginTop: '15px' }}>
                                <Popover
                                    actions={disabledActions}
                                    onSelect={select}
                                    reference={<AddO fontSize="1.5em" />}
                                />
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

            {chatState && !addFriendState && (
                <ChatBox
                    boxMessage={boxMessage}
                    setChatState={setChatState}
                    userinfo={userinfo}
                    sendMessage={sendMessage}
                />
            )}

            {
                addFriendState && (
                    <div>
                        <NavBar
                            title="添加好友"
                            leftText="返回"
                            onClickLeft={() => setAddFriendState(false)}
                        />
                        <Search
                            shape="round"
                            background="#4fc08d"
                            value={search}
                            onChange={setSearch}
                            onSearch={() => { handleSearch() }}
                            placeholder="请输入搜索关键词"
                        />
                        <List finished={true} >
                            {userList.map((user, i) => (
                                <div className='user-item'>
                                    <Flex justify='center' align='center'>
                                        <Flex.Item span={18}>
                                            <Cell
                                                key={user.id}
                                                title={user.nickname || user.username}
                                                icon={<img src={user.cover} alt="from" className="cell-icon" />}
                                                className={"cell-received"}
                                            /></Flex.Item>
                                        <Flex.Item span={6}>
                                            <Button type='default' onClick={() => { handleAddFtiend(user) }} >{addFriendText}</Button>
                                        </Flex.Item>
                                    </Flex>
                                </div>
                            ))}
                        </List>
                    </div>
                )
            }
        </>
    );
}

export default Chat;
