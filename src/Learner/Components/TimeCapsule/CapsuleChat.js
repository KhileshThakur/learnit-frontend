import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import "./CapsuleChat.css"; // Import CSS

const CapsuleChat = ({ capsuleId }) => {
  const backenduri = process.env.REACT_APP_BACKEND;
  const wsurl = process.env.REACT_APP_BACKEND_WS;

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [userInfo, setUserInfo] = useState({ id: "", type: "" });
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const pathname = window.location.pathname;
    const parts = pathname.split("/");
    const type = parts[1];
    const id = parts[2];
    setUserInfo({ id, type });
  }, [backenduri]);

  useEffect(() => {
    if (!userInfo.id || !userInfo.type) return;

    socketRef.current = io(`${wsurl}`, {
      path: "/capsule-chat-socket",
      transports: ["websocket"],
    });

    socketRef.current.emit("joinCapsule", { capsuleId });

    socketRef.current.on("receiveCapsuleMessage", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    fetchMessages();

    return () => {
      socketRef.current.disconnect();
    };
  }, [userInfo, capsuleId,wsurl]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${backenduri}/capsule-chat/${capsuleId}`);
      setMessages(res.data.messages);
      scrollToBottom();
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const sendMessage = () => {
    if (inputMessage.trim() === "") return;

    socketRef.current.emit("sendCapsuleMessage", {
      capsuleId,
      senderId: userInfo.id,
      senderType: userInfo.type,
      message: inputMessage.trim(),
    });

    setInputMessage("");
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.map((msg) => (
          <div key={msg._id} className="message">
            <div className="sender-info">
              {msg.senderName} <span className="sender-type">({msg.senderType === "learner" ? "Learner" : "Instructor"})</span>
            </div>
            <div className="message-text">{msg.message}</div>
            <div className="timestamp">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      <div className="input-container">
        <input
          type="text"
          className="chat-input"
          placeholder="Type your message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} className="send-button">
          Send
        </button>
      </div>
    </div>
  );
};

export default CapsuleChat;
