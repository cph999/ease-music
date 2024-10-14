import React, { useState } from 'react';
import { Button, Input } from 'react-vant';
import './ChatInput.css';

function ChatInput({ onSend }) {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (message.trim()) {
            onSend(message);
            setMessage(''); // 清空输入框内容
        }
    };

    return (
        <div className="chat-input-container">
            <Input
                value={message}
                onChange={setMessage}
                placeholder="请输入..."
                className="chat-input"
                clearable
            />
            <Button 
                type="primary" 
                className="send-button" 
                onClick={handleSend}
            >
                发送
            </Button>
        </div>
    );
}

export default ChatInput;
