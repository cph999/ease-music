import React, { useEffect, useState } from 'react';
import { NavBar, List } from 'react-vant';
import './ChatBox.css';
import ChatItem from './ChatItem.tsx';
import ChatInput from './ChatInput.tsx';

function ChatBox({ boxMessage, setChatState, userinfo, sendMessage }) {
    // 本地的消息列表状态
    const [messages, setMessages] = useState(boxMessage);

    useEffect(() => {
        // 每当 boxMessage 更新时，更新本地的消息列表
        setMessages(boxMessage);
    }, [boxMessage]);

    const handleSend = (newMessage) => {
        // 构建新消息对象
        const newMessageObject = {
            message: newMessage,
            fromId: userinfo.id,
            fromIcon: userinfo.cover,
            toId: userinfo.id === boxMessage[0].fromId ? boxMessage[0].toId : boxMessage[0].fromId,
            createdTime: new Date(),
            fromNickname: userinfo.nickname,
            toNickname: userinfo.id === boxMessage[0].fromId ? boxMessage[0].toNickname : boxMessage[0].fromNickname,
            toIcon: userinfo.id === boxMessage[0].fromId ? boxMessage[0].toIcon : boxMessage[0].fromIcon,
        };

        // 立即将新消息添加到本地消息列表中
        setMessages((prevMessages) => [...prevMessages, newMessageObject]);

        // 同时发送新消息给服务器（或WebSocket）
        sendMessage(newMessageObject);
    };

    return (
        <div className='chat-box'>
            <NavBar
                title={userinfo.id === boxMessage[0].fromId ? boxMessage[0].toNickname : boxMessage[0].fromNickname}
                leftText="返回"
                onClickLeft={() => setChatState(false)}
            />
            <div className='message-block'>
                <List>
                    {messages.map((message, index) => (
                        <ChatItem key={index} message={message} userinfo={userinfo} />
                    ))}
                </List>
            </div>
            <ChatInput onSend={handleSend} />
        </div>
    );
}

export default ChatBox;
