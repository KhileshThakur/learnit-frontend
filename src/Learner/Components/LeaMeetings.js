// LeaMeetings.js

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const TABS = [
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'pending', label: 'Pending Request' },
];

const LeaMeetings = () => {
  const backendurl = process.env.REACT_APP_BACKEND;
  const { id: learnerId } = useParams();
  const [meetings, setMeetings] = useState([]);
  const [status, setStatus] = useState('scheduled');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meetingStatuses, setMeetingStatuses] = useState({});
  const intervalRef = useRef();

  useEffect(() => {
    const fetchMeetings = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${backendurl}/meeting/${status}`, {
          params: { learner_id: learnerId },
        });
        setMeetings(response.data);
      } catch (error) {
        setError('Failed to load meetings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchMeetings();
  }, [status, backendurl, learnerId]);

  // Fetch meeting statuses for scheduled tab (no polling)
  useEffect(() => {
    if (status !== 'scheduled' || meetings.length === 0) {
      setMeetingStatuses({});
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    const fetchStatuses = async () => {
      const updates = {};
      await Promise.all(meetings.map(async (meeting) => {
        try {
          const res = await axios.get(`${backendurl}/meeting/${meeting._id}/status`);
          updates[meeting._id] = res.data;
        } catch {
          updates[meeting._id] = { live: false, status: meeting.status, time: meeting.time };
        }
      }));
      setMeetingStatuses(updates);
    };
    fetchStatuses();
    // No polling
    return () => intervalRef.current && clearInterval(intervalRef.current);
  }, [status, meetings, backendurl]);

  // Filter out scheduled meetings that are more than 90 minutes old
  const filteredMeetings = status === 'scheduled'
    ? meetings.filter(m => {
        const scheduled = new Date((meetingStatuses[m._id]?.time) || m.time);
        const now = new Date();
        return now - scheduled < 90 * 60000;
      })
    : meetings;

  // Helper for friendly empty messages
  const emptyMessage = {
    scheduled: 'No Scheduled Meetings',
    rejected: 'No Rejected Meetings',
    pending: 'No Pending Meetings',
  };

  // Helper for status color
  const statusColor = {
    scheduled: '#4CAF50',
    rejected: '#ff6b6b',
    pending: '#00bcd4',
  };

  // Helper: countdown string
  const getCountdown = (scheduledTime) => {
    const now = new Date();
    const scheduled = new Date(scheduledTime);
    const diff = scheduled - now;
    if (diff <= 0) return '00:00:00';
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="learner-meetings-layout">
      <div className="meetings-card-fullwidth">
        <div className="meetings-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`meetings-tab-btn${status === tab.key ? ' active' : ''}`}
              onClick={() => setStatus(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="meetings-list-scrollable-full">
          <div className="meetings-list">
            {loading ? (
              <div className="meetings-loading">Loading meetings...</div>
            ) : error ? (
              <div className="meetings-error">{error}</div>
            ) : meetings.length === 0 ? (
              <div className="meetings-empty">{emptyMessage[status]}</div>
            ) : (
              filteredMeetings.map((meeting) => {
                // Scheduled tab: poll status, show countdown, enable join only if live and time reached
                if (status === 'scheduled') {
                  const mStatus = meetingStatuses[meeting._id] || { live: false, status: meeting.status, time: meeting.time };
                  const scheduled = new Date(mStatus.time || meeting.time);
                  const now = new Date();
                  const showLive = mStatus.live && now >= scheduled;
                  const countdown = getCountdown(scheduled);
                  return (
                    <div className="meeting-card" key={meeting._id}>
                      <div className="meeting-instructor">
                        <img
                          className="instructor-avatar"
                          src={meeting.instructor_id?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg'}
                          alt="Instructor"
                        />
                        <div className="instructor-info">
                          <div className="instructor-name">{meeting.instructor_id?.name || 'Instructor Name'}</div>
                          <div className="instructor-degree">B.Tech - Computer<br />M.Tech - Computer</div>
                        </div>
                      </div>
                      <div className="meeting-details">
                        <div className="meeting-status scheduled">
                          Meeting is scheduled!
                          {showLive && <span className="meeting-status-live"> &nbsp;| Meeting Status: Live</span>}
                        </div>
                        <div className="meeting-info-row">
                          <span className="meeting-label">Date</span>
                          <span className="meeting-value">{scheduled.toLocaleDateString()}</span>
                        </div>
                        <div className="meeting-info-row">
                          <span className="meeting-label">Time :</span>
                          <span className="meeting-value">{scheduled.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="meeting-info-row">
                          <span className="meeting-label">Countdown:</span>
                          <span className="meeting-value">{countdown}</span>
                        </div>
                      </div>
                      <div className="meeting-actions">
                        {showLive ? (
                          <button className="join-meet-btn">Join Meet</button>
                        ) : null}
                      </div>
                    </div>
                  );
                }
                // Cancelled tab
                if (status === 'rejected') {
                  return (
                    <div className="meeting-card" key={meeting._id}>
                      <div className="meeting-instructor">
                        <img
                          className="instructor-avatar"
                          src={meeting.instructor_id?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg'}
                          alt="Instructor"
                        />
                        <div className="instructor-info">
                          <div className="instructor-name">{meeting.instructor_id?.name || 'Instructor Name'}</div>
                          <div className="instructor-degree">B.Tech - Computer<br />M.Tech - Computer</div>
                        </div>
                      </div>
                      <div className="meeting-details">
                        <div className="meeting-status rejected">Meeting is rejected!</div>
                        <div className="meeting-info-row">
                          <span className="meeting-label">Date</span>
                          <span className="meeting-value">{new Date(meeting.time).toLocaleDateString()}</span>
                        </div>
                        <div className="meeting-info-row">
                          <span className="meeting-label">Time:</span>
                          <span className="meeting-value">{new Date(meeting.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="meeting-reject-message">
                          <span className="meeting-label">Reason:</span>
                          <span className="meeting-value rejection-text">{meeting.rejectionReason || 'No reason provided'}</span>
                        </div>
                      </div>
                      <div className="meeting-actions">
                        <span className="rejected-badge">Rejected</span>
                      </div>
                    </div>
                  );
                }
                // Pending tab
                if (status === 'pending') {
                  return (
                    <div className="meeting-card" key={meeting._id}>
                      <div className="meeting-instructor">
                        <img
                          className="instructor-avatar"
                          src={meeting.instructor_id?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg'}
                          alt="Instructor"
                        />
                        <div className="instructor-info">
                          <div className="instructor-name">{meeting.instructor_id?.name || 'Instructor Name'}</div>
                          <div className="instructor-degree">B.Tech - Computer<br />M.Tech - Computer</div>
                        </div>
                      </div>
                      <div className="meeting-details">
                        <div className="meeting-status pending">Meeting is requested !</div>
                        <div className="meeting-extra-info">
                          <span className="meeting-label">Expertise in :</span> Artificial Intelligence, Machine Learning<br />
                          <span className="meeting-label">Experience :</span> 20+ years<br />
                          <span className="meeting-label">Fees :</span> $50 per hr
                        </div>
                      </div>
                      <div className="meeting-actions">
                        <span className="pending-badge">Requested</span>
                      </div>
                    </div>
                  );
                }
              })
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        .learner-meetings-root {
          background: #181824;
          height: 100vh;
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: stretch;
          overflow: hidden;
        }
        .learner-meetings-layout {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          height: 100vh;
          overflow: hidden;
          padding: 0;
          margin: 0;
        }
        .meetings-card-fullwidth {
          background: #23202b;
          border-radius: 0 0 18px 18px;
          width: 100%;
          height: 100vh;
          box-shadow: 0 4px 24px rgba(0,0,0,0.18);
          display: flex;
          flex-direction: column;
          padding: 0;
          margin: 0;
        }
        .meetings-tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 0;
          padding: 32px 32px 0 32px;
        }
        .meetings-tab-btn {
          background: #353146;
          color: #fff;
          border: none;
          border-radius: 16px 16px 0 0;
          padding: 10px 32px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          outline: none;
          transition: background 0.2s, color 0.2s;
        }
        .meetings-tab-btn.active {
          background: #7c5cff;
          color: #fff;
        }
        .meetings-list-scrollable-full {
          flex: 1;
          overflow-y: auto;
          height: calc(100vh - 70px);
          padding: 32px;
          box-sizing: border-box;
        }
        .meetings-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .meeting-card {
          display: flex;
          align-items: center;
          background: #29263a;
          border-radius: 14px;
          padding: 24px 32px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.10);
          gap: 32px;
        }
        .meeting-instructor {
          display: flex;
          align-items: center;
          gap: 18px;
        }
        .instructor-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #7c5cff;
        }
        .instructor-info {
          color: #fff;
        }
        .instructor-name {
          font-size: 20px;
          font-weight: 700;
        }
        .instructor-degree {
          font-size: 13px;
          color: #bdbdbd;
        }
        .meeting-details {
          flex: 1;
        }
        .meeting-status {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .meeting-status.scheduled {
          color: #4CAF50;
        }
        .meeting-status.rejected {
          color: #ff6b6b;
        }
        .meeting-status.pending {
          color: #00bcd4;
        }
        .meeting-info-row {
          display: flex;
          gap: 16px;
          font-size: 15px;
          margin-bottom: 2px;
        }
        .meeting-label {
          color: #bdbdbd;
          font-weight: 500;
          min-width: 60px;
        }
        .meeting-value {
          color: #fff;
          font-weight: 600;
        }
        .meeting-reject-message {
          margin-top: 8px;
          color: #ff6b6b;
          font-size: 15px;
        }
        .meeting-extra-info {
          margin-top: 8px;
          color: #bdbdbd;
          font-size: 14px;
        }
        .meeting-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
        }
        .join-meet-btn {
          background: #4CAF50;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 10px 24px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .join-meet-btn:hover {
          background: #388e3c;
        }
        .pending-badge {
          background: #00bcd4;
          color: #fff;
          border-radius: 6px;
          padding: 6px 16px;
          font-size: 14px;
          font-weight: 600;
        }
        .rejected-badge {
          background: #ff6b6b;
          color: #fff;
          border-radius: 6px;
          padding: 6px 16px;
          font-size: 14px;
          font-weight: 600;
        }
        .meetings-loading, .meetings-error, .meetings-empty {
          color: #bdbdbd;
          text-align: center;
          font-size: 18px;
          margin: 40px 0;
        }
        .meeting-status-live {
          color: #4CAF50;
          font-weight: bold;
        }
        @media (max-width: 700px) {
          .meetings-card-fullwidth { padding: 16px 4px; }
          .meeting-card { flex-direction: column; gap: 16px; padding: 16px 8px; }
        }
      `}</style>
    </div>
  );
};

export default LeaMeetings;
