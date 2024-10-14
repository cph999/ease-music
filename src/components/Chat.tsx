import React from 'react';
import { useState, useEffect } from 'react';
import { instance } from '../utils/api';
import { Toast } from 'react-vant';
import { PullRefresh, List, Tabs, Cell, Flex, Image, Badge } from 'react-vant';
import './Chat.css';
import defaultIcon from '../assets/images/3.png';
import ChatBox from './ChatBox.tsx';


function Chat({ userinfo }) {

    const [messages, setMessages] = useState([])
    const [finish, setFinish] = useState(false)
    const [boxMessage, setBoxMessage] = useState({})
    const [chatState, setChatState] = useState(false)
    const onLoadRefresh = async (isRefresh?) => {
        if (userinfo === null || JSON.stringify(userinfo) === '{}') Toast.fail('请先登录');
        instance.post("/messages").then(res => {
            console.log("res", res)
            setMessages(res.data.datas)
            setFinish(true)
        }).catch(error => {
            console.log("error", error)
            Toast.fail('获取聊天记录失败，请稍后重试')
        });
    }
    const handleCickMessage = (message) => {
        setBoxMessage(message)
        setChatState(true)
    }
    const onRefresh = async () => {
        setFinish(false)
        await onLoadRefresh(1)
    }
    return (
        <>
            {!chatState &&
                < div className='chat-box'>
                    <div className='chat-header'>
                        <Flex justify='between' align='center'>
                            <Flex.Item span={12}>
                                <Badge dot offset={['50%', '100%']} color="#87d068">
                                    <Image round fit='cover' width='50%' height='50%' src={(userinfo && userinfo.cover) || defaultIcon} />
                                </Badge>
                                <span style={{ position: "absolute", top: '85%', left: '38%', fontSize: '15px' }}>{userinfo.nickname}</span>
                            </Flex.Item>
                            <Flex.Item span={12}></Flex.Item>
                        </Flex>
                    </div>
                    <div className='list-container'>
                        <PullRefresh onRefresh={onRefresh}>
                            {/* List 组件可以与 PullRefresh 组件结合使用，实现下拉刷新的效果 */}
                            <List finished={finish} onLoad={onLoadRefresh}>
                                {messages.map((message, index) => (
                                    <Cell
                                        key={message[0].id}
                                        title={userinfo.id === message[0].fromId ? message[0].toNickname : message[0].fromNickname}
                                        label={message[0].message}
                                        icon={<img src={userinfo.id === message[0].fromId ? message[0].toIcon : message[0].fromIcon} alt="from" style={{ width: 30, height: 30, borderRadius: '50%' }} />}
                                        value={message[0].showTime}
                                        onClick={() => { handleCickMessage(message) }}
                                    />
                                ))}
                            </List>
                        </PullRefresh>
                    </div>
                </div >
            }

            {chatState &&
                <ChatBox boxMessage={boxMessage} setChatState={setChatState} userinfo={userinfo}></ChatBox>
            }
        </>
    )
}

export default Chat;