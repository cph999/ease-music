import React, { useState } from 'react';
import { Button, Input } from 'react-vant';
import './ChatInput.css';
import EmojiPicker from 'emoji-picker-react';
import { SmileO } from '@react-vant/icons';

function ChatInput({ onSend }) {
    const [message, setMessage] = useState('');
    const [showEmoji, setShowEmoji] = useState(false);

    const handleSend = () => {
        if (message.trim()) {
            onSend(message);
            setMessage('');
            setShowEmoji(false);
        }
    };

    const handleEmojiClick = (event, emojiObject) => {
        // console.log("event", event)
        setMessage((prevMessage) => prevMessage + event.emoji);
        setShowEmoji(false);
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
            {showEmoji && (
                <div >
                    <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        style={{
                            position: 'absolute',
                            bottom: '50px',
                            right: '10px',
                            zIndex: 10
                        }}
                    />
                </div>
            )}
            <SmileO
                fontSize="2.5em"
                onClick={() => setShowEmoji(!showEmoji)}
                className="emoji-icon"
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
