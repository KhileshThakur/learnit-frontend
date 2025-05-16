import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const InsScheduledMeetings = () => {
    const backendurl = process.env.REACT_APP_BACKEND;
    const { id: instructorId } = useParams();
    const [meetings, setMeetings] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchScheduledMeetings = async () => {
            try {
                const response = await axios.get(`${backendurl}/meeting/scheduled/${instructorId}`);
                setMeetings(response.data);
            } catch (error) {
                console.error('Error fetching scheduled meetings:', error);
            }
        };
        fetchScheduledMeetings();
    }, [backendurl, instructorId]);

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(part => part[0]).join('').substring(0, 2).toUpperCase();
    };

    const formatDateTime = (dt) => {
        if (!dt) return '';
        const date = new Date(dt);
        return date.toLocaleString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    const handleStartMeeting = (meeting) => {
        // For now, just alert. Replace with real navigation/logic later.
        alert(`Starting meeting with ${meeting.learner_id?.name} on topic: ${meeting.topic}`);
        // Example: navigate(`/classroom/${meeting._id}`);
    };

    return (
        <div className="ins-meeting-requests-container">
            <h2 className="ins-meeting-title">Scheduled Meetings</h2>
            <div className="ins-meeting-list-scroll">
                {meetings.length === 0 ? (
                    <div className="no-meetings">No scheduled meetings.</div>
                ) : (
                    meetings.map((meeting) => (
                        <div className="ins-meeting-card" key={meeting._id}>
                            <div className="ins-meeting-avatar">
                                <div className="avatar-circle">
                                    {getInitials(meeting.learner_id?.name)}
                                </div>
                            </div>
                            <div className="ins-meeting-info">
                                <div className="ins-meeting-row">
                                    <span className="ins-meeting-learner"><b>{meeting.learner_id?.name}</b></span>
                                    <span className="ins-meeting-email">{meeting.learner_id?.email}</span>
                                </div>
                                <div className="ins-meeting-row">
                                    <span className="ins-meeting-label">Subject:</span>
                                    <span className="ins-meeting-value">{meeting.subject}</span>
                                </div>
                                <div className="ins-meeting-row">
                                    <span className="ins-meeting-label">Topic:</span>
                                    <span className="ins-meeting-value">{meeting.topic}</span>
                                </div>
                                <div className="ins-meeting-row">
                                    <span className="ins-meeting-label">Scheduled:</span>
                                    <span className="ins-meeting-value">{formatDateTime(meeting.time)}</span>
                                </div>
                            </div>
                            <div className="ins-meeting-actions">
                                <button className="start-btn" onClick={() => handleStartMeeting(meeting)}>
                                    Start Meeting
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <style>{`
                .ins-meeting-requests-container {
                    max-width: 900px;
                    margin: 40px auto;
                    background: #23232b;
                    border-radius: 18px;
                    padding: 32px 32px 24px 32px;
                    box-shadow: 0 2px 16px rgba(0,0,0,0.12);
                }
                .ins-meeting-title {
                    color: #fff;
                    font-size: 1.6rem;
                    margin-bottom: 18px;
                }
                .ins-meeting-list-scroll {
                    max-height: 520px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                }
                .ins-meeting-card {
                    display: flex;
                    align-items: center;
                    background: #292938;
                    border-radius: 12px;
                    padding: 18px 24px;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
                    margin-bottom: 8px;
                }
                .ins-meeting-avatar {
                    margin-right: 18px;
                }
                .avatar-circle {
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    background: #4a4a4a;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.4rem;
                    font-weight: 600;
                }
                .ins-meeting-info {
                    flex: 1;
                }
                .ins-meeting-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 4px;
                }
                .ins-meeting-learner {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #fff;
                }
                .ins-meeting-email {
                    font-size: 0.98rem;
                    color: #bdbdbd;
                    margin-left: 12px;
                }
                .ins-meeting-label {
                    font-size: 1rem;
                    color: #bdbdbd;
                    font-weight: 600;
                }
                .ins-meeting-value {
                    font-size: 1rem;
                    color: #fff;
                    font-weight: 500;
                }
                .ins-meeting-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin-left: 24px;
                }
                .start-btn {
                    background: #4caf50;
                    color: #fff;
                    border: none;
                    border-radius: 8px;
                    padding: 10px 22px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    margin-bottom: 6px;
                }
                .start-btn:hover {
                    background: #388e3c;
                }
                @media (max-width: 600px) {
                    .ins-meeting-requests-container {
                        padding: 10px;
                    }
                    .ins-meeting-card {
                        flex-direction: column;
                        align-items: flex-start;
                        padding: 14px 10px;
                    }
                    .ins-meeting-actions {
                        flex-direction: row;
                        gap: 10px;
                        margin-left: 0;
                        margin-top: 10px;
                    }
                }
            `}</style>
        </div>
    );
};

export default InsScheduledMeetings; 