// import React, { useEffect } from 'react';
// import { Toast, NavBar, List, Cell, Flex } from 'react-vant';
// import './ChatBox.css'
// import ChatItem from './ChatItem.tsx';
// function ChatBox({ boxMessage, setChatState, userinfo }) {

//     return (
//         <div>
//             <NavBar
//                 title={userinfo.id === boxMessage[0].fromId ? boxMessage[0].toNickname : boxMessage[0].fromNickname}
//                 leftText="返回"
//                 onClickLeft={() => setChatState(false)}
//             />
//             <div className='message-block'>
//                 <List>
//                     {boxMessage.map((message, index) => (
//                         <ChatItem message={message} userinfo={userinfo} ></ChatItem>
//                     ))}
//                 </List>
//             </div>
//         </div>
//     );
// }

// export default ChatBox;

import React, { useState } from 'react';
import { NavBar, List } from 'react-vant';
import './ChatBox.css';
import ChatItem from './ChatItem.tsx';
import ChatInput from './ChatInput.tsx';

function ChatBox({ boxMessage, setChatState, userinfo }) {
    const [messages, setMessages] = useState(boxMessage);

    const handleSend = (newMessage) => {
        const newMessageObject = {
            id: messages.length + 1,
            message: newMessage,
            fromId: userinfo.id,
            fromIcon: userinfo.cover,
            toId: userinfo.id === boxMessage[0].fromId ? boxMessage[0].toId : boxMessage[0].fromId,
            createdTime: new Date(),
        };
        setMessages([...messages, newMessageObject]);
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
