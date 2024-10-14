import React, { useEffect } from 'react';
import { Image, Typography } from 'react-vant';
import './ChatItem.css';

function ChatItem({ message, userinfo }) {

    const isSentByUser = userinfo.id === message.fromId;

    return (
        <div className={`message-item ${isSentByUser ? 'sent' : 'received'}`}>
            {!isSentByUser && (
                <Image
                    src={message.fromIcon}
                    alt="user avatar"
                    className="avatar"
                />
            )}
            <Typography.Text
                className="message-bubble"
                size="lg"
                style={{ backgroundColor: "#a9e97b" }}
            >
                {message.message}
            </Typography.Text>
            {isSentByUser && (
                <Image
                    src={userinfo.cover}
                    alt="user avatar"
                    className="avatar"
                />
            )}
        </div>
    );
}

export default ChatItem;
