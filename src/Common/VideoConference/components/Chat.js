import React, { useState, useRef, useEffect } from 'react';
import { IoMdSend } from 'react-icons/io';
import './Chat.css';

const Chat = ({ messages, onSendMessage, currentUser }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  // Auto scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === '') return;
    
    onSendMessage(message);
    setMessage('');
  };
  
  // Format timestamp to human readable format
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };
  
  // Get sender initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Check if there are any messages
  const hasMessages = Array.isArray(messages) && messages.length > 0;

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Meeting Chat</h3>
      </div>
      
      <div className="chat-messages">
        {!hasMessages ? (
          <div className="no-messages">
            <p>No messages yet</p>
            <p>Be the first to send a message!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            // Safely handle message object structure with fallbacks
            const senderId = msg.sender?.id || '';
            const senderName = msg.sender?.name || 'Unknown';
            const content = msg.content || msg.text || '';
            const time = msg.timestamp || Date.now();
            const isOwnMessage = senderId === currentUser.id;
            
            return (
              <div 
                key={index} 
                className={`chat-message ${isOwnMessage ? 'own-message' : ''}`}
              >
                <div className="message-avatar">
                  {getInitials(senderName)}
                </div>
                <div className="message-bubble">
                  <div className="message-content-wrapper">
                    <div className="message-header">
                      <span className="message-sender">
                        {isOwnMessage ? 'You' : senderName}
                      </span>
                      {msg.sender?.role && (
                        <span className="sender-role">
                          {msg.sender.role === 'instructor' ? '(Instructor)' : 
                           msg.sender.role === 'admin' ? '(Admin)' : ''}
                        </span>
                      )}
                    </div>
                    <div className="message-content">{content}</div>
                    <div className="message-timestamp">
                      {formatTimestamp(time)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form className="chat-input" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button 
          type="submit" 
          disabled={!message.trim()}
          title={message.trim() ? "Send message" : "Type a message to send"}
        >
          <IoMdSend />
        </button>
      </form>
    </div>
  );
};

export default Chat; 