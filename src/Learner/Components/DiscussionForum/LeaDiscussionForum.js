// LeaDiscussionForum.js
import React, { useState, useEffect } from 'react';
import Thread from './Thread';
import NewPost from './NewPost';
import './LeaDiscussionForum.css';
import axios from 'axios';

const LeaDiscussionForum = () => {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);

  // Function to add a new thread (question)
  const addThread = async (question) => {
    try {
      const response = await axios.post('http://localhost:5000/api/discussion/thread', { question });
      setThreads([response.data.thread, ...threads]);
    } catch (error) {
      console.error('Error adding thread:', error);
    }
  };
  

  // Function to add a reply to the selected thread
  const addReply = async (reply) => {
    if (selectedThread) {
      try {
        const response = await axios.post(
          `http://localhost:5000/api/discussion/thread/${selectedThread._id}/reply`,
          { content: reply }
        );
  
        const updatedThread = response.data.thread;
        const updatedThreads = threads.map((thread) =>
          thread._id === updatedThread._id ? updatedThread : thread
        );
  
        setThreads(updatedThreads);
        setSelectedThread(updatedThread);
      } catch (error) {
        console.error('Error adding reply:', error);
      }
    }
  };
  

  useEffect(() => {
    fetchThreads();
  }, []);
  
  const fetchThreads = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/discussion/threads');
      setThreads(response.data.threads.reverse()); // reverse for latest first
    } catch (error) {
      console.error('Error fetching threads:', error);
    }
  };
  

  return (
    <div className="discussion-forum-container">
      {/* Questions Section (Left Box) */}
      <div className="questions-section">
        <h2>Latest Questions</h2>
        <div className="questions-list">
          {threads.map((thread) => (
            <Thread
              key={thread.id}
              thread={thread}
              onClick={() => setSelectedThread(thread)}
            />
          ))}
        </div>
        <NewPost onAddThread={addThread} />
      </div>

      {/* Answers Section (Right Box) */}
      <div className="answers-section">
        {selectedThread ? (
          <>
            <h2>{selectedThread.question}</h2>
            <div className="replies-list">
            {selectedThread.replies.map((reply, index) => (
  <div key={reply._id || index} className="reply">
    <p>{reply.content}</p> {/* ✅ Only show the reply text */}
    {/* Optional: <small>{new Date(reply.createdAt).toLocaleString()}</small> */}
  </div>
))}

            </div>
            <NewPost onAddReply={addReply} />
          </>
        ) : (
          <h2>Select a question to view answers</h2>
        )}
      </div>
    </div>
  );
};

export default LeaDiscussionForum;