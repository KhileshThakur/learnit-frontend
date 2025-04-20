import React, { useState } from 'react';
import axios from 'axios';

function LeaLearnAI() {
  const backenduri = process.env.REACT_APP_BACKEND;
  const [prompt, setPrompt] = useState('');
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = async (e) => {

    e.preventDefault();
    if (!prompt.trim()) return;

    const userMessage = { type: 'user', text: prompt };
    setChats((prev) => [userMessage, ...prev]);
    setPrompt('');
    setLoading(true);

    try {
      const result = await axios.post(`${backenduri}/learnai`, { prompt });
      const botMessage = { type: 'bot', text: result.data.text };
      setChats((prev) => [botMessage, ...prev]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { type: 'bot', text: 'Error fetching response. Please try again.' };
      setChats((prev) => [errorMessage, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Learn AI</h2>

      <div style={styles.chatBox}>
        {chats.map((chat, index) => (
          <div
            key={index}
            style={{
              ...styles.chatMessage,
              alignSelf: chat.type === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: chat.type === 'user' ? '#d1e7dd' : '#f8d7da',
            }}
          >
            {chat.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={styles.inputArea}>
        <input
          type="text"
          value={prompt}
          onChange={handlePromptChange}
          placeholder="Type your prompt..."
          style={styles.input}
        />
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    margin: 'auto',
    height: '95vh',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    boxSizing: 'border-box',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '10px',
  },
  chatBox: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column-reverse',
    overflowY: 'auto',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    marginBottom: '10px',
    backgroundColor: '#fafafa',
  },
  chatMessage: {
    maxWidth: '70%',
    padding: '10px',
    margin: '5px 0',
    borderRadius: '10px',
    fontSize: '15px',
  },
  inputArea: {
    display: 'flex',
    gap: '10px',
  },
  input: {
    flex: 1,
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '10px 16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
};

export default LeaLearnAI;
