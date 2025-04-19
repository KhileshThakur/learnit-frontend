import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';

const Chat = ({ roomId, userName, socket, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Initialize with a system message
  useEffect(() => {
    setMessages([{
      sender: 'System',
      text: 'Welcome to the chat!',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  }, []);

  // Set up socket listener for incoming messages
  useEffect(() => {
    if (socket) {
      socket.on('chatMessage', (message) => {
        setMessages(prev => [...prev, message]);
      });
    }
    
    return () => {
      if (socket) {
        socket.off('chatMessage');
      }
    };
  }, [socket]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newMsg = {
      sender: userName,
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    // Send to server if socket exists
    if (socket) {
      socket.emit('sendMessage', {
        roomId,
        message: newMsg
      });
    }
    
    // Also add to local state for immediate feedback
    setMessages([...messages, newMsg]);
    setNewMessage('');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Chat</h3>
        <button onClick={onClose} className="close-btn">
          ✕
        </button>
      </div>
      
      <div className="messages-container">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`message ${
              msg.sender === userName 
                ? 'self-message' 
                : msg.sender === 'System'
                  ? 'system-message'
                  : 'other-message'
            }`}
          >
            {msg.sender !== userName && msg.sender !== 'System' && (
              <p className="message-sender">{msg.sender}</p>
            )}
            <p className="message-text">{msg.text}</p>
            <p className="message-time">{msg.time}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
        />
        <button 
          type="submit"
          className="send-btn"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat; 