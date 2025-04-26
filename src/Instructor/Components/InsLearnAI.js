import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

function InsLearnAI() {
  const backenduri = process.env.REACT_APP_BACKEND;
  const [prompt, setPrompt] = useState('');
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [optimizing, setOptimizing] = useState(false);

  const handlePromptChange = (e) => setPrompt(e.target.value);

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

  const handleOptimize = async () => {
    // Ensure prompt is not undefined or empty
    if (!prompt || !prompt.trim()) {
      console.error('Prompt is empty or undefined');
      return;
    }
  
    setOptimizing(true);
  
    try {
      const res = await axios.post(`${backenduri}/learnai/optimize`, { prompt });
  
      // Log the full response to understand its structure
      console.log('Optimization response:', res);
  
      // Assuming the optimized prompt is inside res.data.optimizedPrompt
      if (res && res.data && res.data.optimizedPrompt) {
        console.log('Optimized Prompt:', res.data.optimizedPrompt);  // Log the optimized prompt
        setOptimizedPrompt(res.data.optimizedPrompt);  // Correctly set the optimized prompt
        setShowModal(true);  // Show the modal with the optimized prompt
      } else {
        console.error('Optimized prompt field not found in response:', res.data);
        alert('Failed to optimize prompt. No valid response.');
      }
    } catch (error) {
      console.error('Optimization Error:', error);
      alert('Failed to optimize prompt.');
    } finally {
      setOptimizing(false);
    }
  };
  
  

  const handleUseOptimized = () => {
    setPrompt(optimizedPrompt);
    setShowModal(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const renderMessage = (chat, index) => {
    const isBot = chat.type === 'bot';

    return (
      <div
        key={index}
        style={{
          ...styles.chatMessage,
          alignSelf: isBot ? 'flex-start' : 'flex-end',
          backgroundColor: isBot ? '#2a2f3a' : '#4caf50',
          color: '#fff',
          position: 'relative',
        }}
      >
        {isBot && (
          <button
            onClick={() => copyToClipboard(chat.text)}
            style={styles.copyButton}
            title="Copy"
          >
            📋
          </button>
        )}
        <ReactMarkdown
          children={chat.text}
          components={{
            code({ node, inline, className, children, ...props }) {
              return !inline ? (
                <SyntaxHighlighter
                  style={oneDark}
                  language={(className || '').replace('language-', '')}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code style={styles.inlineCode} {...props}>
                  {children}
                </code>
              );
            },
          }}
        />
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Learn AI</h2>

      <div style={styles.chatBox}>
        {chats.map((chat, index) => renderMessage(chat, index))}
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
        <button type="button" onClick={handleOptimize} disabled={optimizing} style={styles.button}>
          {optimizing ? '...' : 'Optimize Prompt'}
        </button>
      </form>

      {showModal && (
  <div style={styles.modalOverlay}>
    <div style={styles.modalContent}>
      <h3>Optimized Prompt</h3>
      <textarea
        readOnly
        value={optimizedPrompt}  // Correctly display the optimized prompt here
        style={{ width: '100%', height: '150px', marginBottom: '10px', padding: '10px' }}
      />
      <button onClick={handleUseOptimized} style={styles.button}>Use This Prompt</button>
      <button onClick={() => setShowModal(false)} style={{ ...styles.button, backgroundColor: '#999', marginLeft: '10px' }}>
        Close
      </button>
    </div>
  </div>
)}


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
    backgroundColor: '#1e1e2f',
    color: 'white',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '10px',
    color: 'white',
  },
  chatBox: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column-reverse',
    overflowY: 'auto',
    padding: '10px',
    border: '1px solid #333',
    borderRadius: '8px',
    marginBottom: '10px',
    backgroundColor: '#12121a',
  },
  chatMessage: {
    maxWidth: '75%',
    padding: '10px',
    margin: '5px 0',
    borderRadius: '10px',
    fontSize: '15px',
    wordWrap: 'break-word',
    whiteSpace: 'pre-wrap',
  },
  copyButton: {
    position: 'absolute',
    top: '5px',
    right: '5px',
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
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
    border: '1px solid #444',
    backgroundColor: '#2a2a40',
    color: 'white',
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
  inlineCode: {
    backgroundColor: '#333',
    padding: '2px 4px',
    borderRadius: '4px',
    fontFamily: 'monospace',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#2c2c3c',
    color: 'white',
    padding: '20px',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
  },
};

export default InsLearnAI;
