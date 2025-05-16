import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const InsMeetingRequest = () => {
    const backendurl = process.env.REACT_APP_BACKEND;
    const { id: instructorId } = useParams();
    const [pendingMeetings, setPendingMeetings] = useState([]);
    const [rejectedMeetings, setRejectedMeetings] = useState([]);
    const [schedulingId, setSchedulingId] = useState(null);
    const [newTime, setNewTime] = useState('');
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'rejected'
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectingMeetingId, setRejectingMeetingId] = useState(null);

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const [pendingRes, rejectedRes] = await Promise.all([
                    axios.get(`${backendurl}/meeting/pending/${instructorId}`),
                    axios.get(`${backendurl}/meeting/cancelled/${instructorId}`)
                ]);
                setPendingMeetings(pendingRes.data);
                setRejectedMeetings(rejectedRes.data);
            } catch (error) {
                console.error('Error fetching meetings:', error);
            }
        };
        fetchMeetings();
    }, [backendurl, instructorId]);

    const handleScheduleClick = (meetingId) => {
        setSchedulingId(meetingId);
        setNewTime('');
    };

    const handleConfirmSchedule = async (meeting) => {
        try {
            await axios.put(`${backendurl}/meeting/${meeting._id}`, {
                action: 'schedule',
                time: newTime
            });
            // Refresh meetings after updating
            const [pendingRes, rejectedRes] = await Promise.all([
                axios.get(`${backendurl}/meeting/pending/${instructorId}`),
                axios.get(`${backendurl}/meeting/cancelled/${instructorId}`)
            ]);
            setPendingMeetings(pendingRes.data);
            setRejectedMeetings(rejectedRes.data);
            setSchedulingId(null);
            setNewTime('');
        } catch (error) {
            console.error('Error scheduling meeting:', error);
        }
    };

    const handleReject = (meetingId) => {
        setRejectingMeetingId(meetingId);
        setShowRejectModal(true);
        setRejectReason('');
    };

    const handleRejectSubmit = async () => {
        try {
            await axios.put(`${backendurl}/meeting/${rejectingMeetingId}`, {
                action: 'cancel',
                reason: rejectReason
            });
            setShowRejectModal(false);
            setRejectingMeetingId(null);
            setRejectReason('');
            // Refresh meetings after updating
            const [pendingRes, rejectedRes] = await Promise.all([
                axios.get(`${backendurl}/meeting/pending/${instructorId}`),
                axios.get(`${backendurl}/meeting/cancelled/${instructorId}`)
            ]);
            setPendingMeetings(pendingRes.data);
            setRejectedMeetings(rejectedRes.data);
        } catch (error) {
            console.error('Error cancelling meeting:', error);
        }
    };

    // Helper to get initials from name
    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(part => part[0]).join('').substring(0, 2).toUpperCase();
    };

    // Helper to format date/time
    const formatDateTime = (dt) => {
        if (!dt) return '';
        const date = new Date(dt);
        return date.toLocaleString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    const renderMeetingCard = (meeting, isPending = true) => (
        <div className={`ins-meeting-card${!isPending ? ' rejected' : ''}`} key={meeting._id}>
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
                    <span className="ins-meeting-label">Requested:</span>
                    <span className="ins-meeting-value">{formatDateTime(meeting.time)}</span>
                </div>
                {isPending && schedulingId === meeting._id && (
                    <div className="ins-meeting-row schedule-row">
                    <input
                        type="datetime-local"
                        value={newTime}
                            onChange={e => setNewTime(e.target.value)}
                            className="schedule-input"
                    />
                        <button className="schedule-confirm-btn" onClick={() => handleConfirmSchedule(meeting)}>
                            Confirm
                        </button>
                        <button className="schedule-cancel-btn" onClick={() => setSchedulingId(null)}>
                            Cancel
                        </button>
                    </div>
                )}
            </div>
            {isPending && (
                <div className="ins-meeting-actions">
                    {schedulingId !== meeting._id && (
                        <>
                            <button className="schedule-btn" onClick={() => handleScheduleClick(meeting._id)}>
                                Schedule
                            </button>
                            <button className="reject-btn" onClick={() => handleReject(meeting._id)}>
                                Reject
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <div className="ins-meeting-requests-container">
            <div className="meeting-tabs-centered">
                <div className="meeting-tabs">
                    <button
                        className={`meeting-tab${activeTab === 'pending' ? ' active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Pending Request
                    </button>
                    <button
                        className={`meeting-tab${activeTab === 'rejected' ? ' active' : ''}`}
                        onClick={() => setActiveTab('rejected')}
                    >
                        Rejected
                    </button>
                </div>
            </div>
            {activeTab === 'pending' && (
                <>
                    <h2 className="ins-meeting-title">Pending Meeting Requests</h2>
                    <div className="ins-meeting-list-scroll">
                        {pendingMeetings.length === 0 ? (
                            <div className="no-meetings">No pending meeting requests.</div>
                        ) : (
                            pendingMeetings.map((meeting) => renderMeetingCard(meeting, true))
                        )}
                    </div>
                </>
            )}
            {activeTab === 'rejected' && (
                <>
                    <h2 className="ins-meeting-title">Rejected Meeting Requests</h2>
                    <div className="ins-meeting-list-scroll">
                        {rejectedMeetings.length === 0 ? (
                            <div className="no-meetings">No rejected meeting requests.</div>
                        ) : (
                            rejectedMeetings.map((meeting) => renderMeetingCard(meeting, false))
                        )}
                    </div>
                </>
            )}
            {showRejectModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Reject Meet</h3>
                        <label htmlFor="reject-reason">Message :</label>
                        <textarea
                            id="reject-reason"
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            placeholder="Enter reason for rejection..."
                            rows={5}
                            style={{ width: '100%', margin: '12px 0', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                            <button className="reject-btn" onClick={handleRejectSubmit} disabled={!rejectReason.trim()}>
                                Reject Meet and Notify Learner
                            </button>
                            <button className="cancel-btn" onClick={() => setShowRejectModal(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                .meeting-tabs-centered {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-bottom: 32px;
                }
                .meeting-tabs {
                    display: flex;
                    gap: 24px;
                    background: none;
                    box-shadow: none;
                    padding: 0;
                }
                .meeting-tab {
                    background: #44424e;
                    color: #fff;
                    border: none;
                    outline: none;
                    padding: 18px 54px;
                    font-size: 1.25rem;
                    font-weight: 700;
                    border-radius: 999px;
                    transition: background 0.2s, color 0.2s, box-shadow 0.2s;
                    cursor: pointer;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
                    position: relative;
                    letter-spacing: 0.5px;
                }
                .meeting-tab:not(.active):hover {
                    background: #5a5770;
                    color: #e0e0e0;
                }
                .meeting-tab.active {
                    background: #a57bff;
                    color: #23232b;
                    z-index: 2;
                    box-shadow: 0 2px 8px rgba(165,123,255,0.18);
                }
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
                    max-height: 320px;
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
                .ins-meeting-card.rejected {
                    opacity: 0.7;
                    background: #3a2a2a;
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
                .schedule-btn {
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
                .schedule-btn:hover, .schedule-confirm-btn:hover {
                    background: #388e3c;
                }
                .reject-btn, .schedule-cancel-btn {
                    background: #c62828;
                    color: #fff;
                    border: none;
                    border-radius: 8px;
                    padding: 10px 22px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                }
                .reject-btn:hover, .schedule-cancel-btn:hover {
                    background: #a31515;
                }
                .schedule-row {
                    margin-top: 10px;
                    gap: 10px;
                }
                .schedule-input {
                    padding: 8px 12px;
                    border-radius: 6px;
                    border: none;
                    font-size: 1rem;
                }
                .schedule-confirm-btn {
                    background: #4caf50;
                    color: #fff;
                    border: none;
                    border-radius: 8px;
                    padding: 10px 18px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                }
                @media (max-width: 600px) {
                    .ins-meeting-requests-container {
                        padding: 10px;
                    }
                    .meeting-tabs-centered {
                        margin-bottom: 24px;
                    }
                    .meeting-tabs {
                        flex-direction: column;
                        gap: 16px;
                        padding: 4px 0;
                    }
                    .meeting-tab {
                        width: 100%;
                        padding: 12px 0;
                        font-size: 1rem;
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

export default InsMeetingRequest;
