import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

import Thread from './Thread';
import NewPost from './NewPost';
import './LeaDiscussionForum.css';

const LeaDiscussionForum = () => {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);

  // Extract role and ID from URL
  const location = useLocation();
  const pathSegments = location.pathname.split('/'); // ['', 'instructor', 'id', 'dashboard']
  const authorType = pathSegments[1] === 'instructor' ? 'Instructor' : 'Learner';
  const authorId = pathSegments[2];

  // Fetch threads on component mount
  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/discussion/threads');
      setThreads(response.data.threads.reverse()); // latest first
    } catch (error) {
      console.error('Error fetching threads:', error);
    }
  };

  // Add new thread
  const addThread = async (question) => {
    try {
      const response = await axios.post('http://localhost:5000/api/discussion/thread', {
        question,
        authorType,
        authorId,
      });
      setThreads([response.data.thread, ...threads]);
    } catch (error) {
      console.error('Error adding thread:', error);
    }
  };

  // Add reply to selected thread
  const addReply = async (reply) => {
    if (selectedThread) {
      try {
        const response = await axios.post(
          `http://localhost:5000/api/discussion/thread/${selectedThread._id}/reply`,
          {
            content: reply,
            authorType,
            authorId
          }
        );

        const newReply = response.data.reply;

        // Update the selectedThread with the new reply
        const updatedSelectedThread = {
          ...selectedThread,
          replies: [...selectedThread.replies, newReply]
        };

        // Update the thread list also
        const updatedThreads = threads.map((thread) =>
          thread._id === selectedThread._id ? updatedSelectedThread : thread
        );

        setThreads(updatedThreads);
        setSelectedThread(updatedSelectedThread);

      } catch (error) {
        console.error('Error adding reply:', error);
      }
    }
  };




  return (
    <div className="discussion-forum-container">
      {/* Left: Threads List */}
      <div className="questions-section">
        <h2 className="posts-heading">Posts</h2>
        <div className="questions-list">
          {threads.map((thread) => (
            <Thread
              key={thread._id}
              thread={thread}
              onClick={() => setSelectedThread(thread)}
              isSelected={selectedThread && selectedThread._id === thread._id}
            />
          ))}
        </div>
        <NewPost onAddThread={addThread} />
      </div>

      {/* Right: Replies */}
      <div className="answers-section">
        {selectedThread ? (
          
          <>
            <h2 className="responses-heading">Responses</h2>
              <h2 className="answer-heading">{selectedThread.question}</h2>
              <div className="replies-list">
                {selectedThread.replies.map((reply, index) => (
                  <div key={reply._id || index} className="reply">
                    {/* Show Reply Author */}
                    <h5>{reply.authorId?.name} ({reply.authorType})</h5>
                    <p>{reply.content}</p>
                    {/* Optional timestamp:
                  <small>{new Date(reply.createdAt).toLocaleString()}</small> */}
                  </div>
                ))}
              </div>
              <NewPost onAddReply={addReply} />
            </>
            ) : (
            <>
              <h2 className="responses-heading">Responses</h2>
              <p>Select posts to view responses.</p>
            </>
          
        )}
      </div>
    </div>
  );
};

export default LeaDiscussionForum;
