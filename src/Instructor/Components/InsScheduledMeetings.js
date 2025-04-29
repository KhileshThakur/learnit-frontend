import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const InsScheduledMeetings = (props) => {
  const backendurl = process.env.REACT_APP_BACKEND;
  // Use instructorId from props if provided, else from URL
  const { id: urlInstructorId } = useParams();
  const instructorId = props.instructorId || urlInstructorId;
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(null); // meetingId being started

  // Helper to fetch status for each meeting
  const fetchMeetingStatuses = async (meetings) => {
    const updated = await Promise.all(meetings.map(async (meeting) => {
      try {
        const res = await fetch(`${backendurl}/meeting/${meeting._id}/status`);
        const data = await res.json();
        return { ...meeting, live: data.live, status: data.status, scheduledTime: data.time };
      } catch {
        return meeting;
      }
    }));
    return updated;
  };

  // Fetch scheduled meetings and their live status
  const fetchMeetings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${backendurl}/meeting/scheduled/${instructorId}`);
      if (!response.ok) throw new Error('Failed to fetch scheduled meetings');
      const data = await response.json();
      const withStatus = await fetchMeetingStatuses(data);
      // Filter out meetings that are more than 90 minutes past scheduled time
      const now = new Date();
      const filtered = withStatus.filter(m => {
        const scheduled = new Date(m.scheduledTime || m.time);
        return now - scheduled < 90 * 60000;
      });
      setMeetings(filtered);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (instructorId) fetchMeetings();
    // No polling
  }, [backendurl, instructorId]);

  // Start meeting handler
  const handleStartMeeting = async (meetingId) => {
    setStarting(meetingId);
    try {
      await fetch(`${backendurl}/meeting/${meetingId}/start`, { method: 'PATCH' });
      await fetchMeetings();
    } catch {}
    setStarting(null);
  };

  // Helper: can start meeting only in the 15 minutes before scheduled time (not after)
  const canStartMeeting = (meeting) => {
    if (meeting.live) return false;
    const now = new Date();
    const scheduled = new Date(meeting.scheduledTime || meeting.time);
    return now >= new Date(scheduled.getTime() - 15 * 60000) && now < scheduled;
  };

  return (
    <div className="scheduled-meetings-root">
      <div className="scheduled-meetings-card">
        <h2>Scheduled Meetings</h2>
        {loading && <div className="scheduled-meetings-loading">Loading scheduled meetings...</div>}
        {error && <div className="scheduled-meetings-error">{error}</div>}
        {!loading && !error && meetings.length === 0 && (
          <div className="scheduled-meetings-empty">No scheduled meetings found.</div>
        )}
        {!loading && !error && meetings.length > 0 && (
          <div className="scheduled-meetings-list">
            {meetings.map((meeting) => {
              const scheduled = new Date(meeting.scheduledTime || meeting.time);
              return (
                <div key={meeting._id} className="scheduled-meeting-card-ui">
                  <div className="scheduled-meeting-left">
                    <img
                      className="scheduled-meeting-avatar"
                      src={meeting.learner_id?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg'}
                      alt={meeting.learner_id?.name || 'Learner'}
                    />
                    <div className="scheduled-meeting-info">
                      <div className="scheduled-meeting-name">{meeting.learner_id?.name || 'Learner Name'}</div>
                      <div className="scheduled-meeting-degree">BE-AI&DS</div>
                      <div className="scheduled-meeting-date-time">
                        {scheduled.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}<br />
                        {scheduled.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div className="scheduled-meeting-center">
                    <div className="scheduled-meeting-subject"><b>Subject:</b> {meeting.subject}</div>
                    <div className="scheduled-meeting-topic"><b>Topic:</b> {meeting.topic}</div>
                  </div>
                  <div className="scheduled-meeting-right">
                    {meeting.live ? (
                      <div className="meeting-status-live">Meeting Status: Live</div>
                    ) : canStartMeeting(meeting) ? (
                      <button className="scheduled-meeting-join-btn" onClick={() => handleStartMeeting(meeting._id)} disabled={starting === meeting._id}>
                        {starting === meeting._id ? 'Starting...' : 'Start Meeting'}
                      </button>
                    ) : null}
                    <div className="scheduled-meeting-joinon">
                      Scheduled on<br />
                      {scheduled.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}<br />
                      {scheduled.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style jsx>{`
        .scheduled-meetings-root {
          background: #181824;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 40px 0;
        }
        .scheduled-meetings-card {
          background: #23202b;
          border-radius: 18px;
          padding: 32px 24px;
          width: 100%;
          max-width: 800px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.18);
        }
        h2 {
          color: #7c5cff;
          margin-bottom: 24px;
        }
        .scheduled-meetings-list {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .scheduled-meeting-card-ui {
          display: flex;
          align-items: center;
          background: #29263a;
          border-radius: 14px;
          padding: 24px 32px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.10);
          gap: 32px;
        }
        .scheduled-meeting-left {
          display: flex;
          align-items: center;
          gap: 18px;
        }
        .scheduled-meeting-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #7c5cff;
        }
        .scheduled-meeting-info {
          color: #fff;
        }
        .scheduled-meeting-name {
          font-size: 20px;
          font-weight: 700;
        }
        .scheduled-meeting-degree {
          font-size: 13px;
          color: #bdbdbd;
        }
        .scheduled-meeting-date-time {
          font-size: 13px;
          color: #bdbdbd;
        }
        .scheduled-meeting-center {
          flex: 1;
        }
        .scheduled-meeting-subject, .scheduled-meeting-topic {
          font-size: 15px;
          color: #fff;
        }
        .scheduled-meeting-topic {
          margin-top: 4px;
        }
        .scheduled-meeting-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
        }
        .scheduled-meeting-join-btn {
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
        .scheduled-meeting-join-btn:hover {
          background: #388e3c;
        }
        .scheduled-meeting-joinon {
          background: #23202b;
          color: #bdbdbd;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 13px;
          text-align: right;
        }
        .scheduled-meetings-loading, .scheduled-meetings-error, .scheduled-meetings-empty {
          color: #bdbdbd;
          text-align: center;
          font-size: 18px;
          margin: 40px 0;
        }
        .meeting-status-live {
          color: #4CAF50;
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 8px;
        }
        @media (max-width: 700px) {
          .scheduled-meetings-card { padding: 16px 4px; }
          .scheduled-meeting-card-ui { flex-direction: column; gap: 16px; padding: 16px 8px; }
        }
      `}</style>
    </div>
  );
};

export default InsScheduledMeetings; 