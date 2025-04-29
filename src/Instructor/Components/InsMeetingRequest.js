import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Popup from 'reactjs-popup';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './InsMeetingRequest.css';

const TABS = [
    { key: 'pending', label: 'Pending Requests' },
    { key: 'rejected', label: 'Rejected Meetings' },
];

const InsMeetingRequest = () => {
    const backendurl = process.env.REACT_APP_BACKEND;
    const { id: instructorId } = useParams();
    const [meetings, setMeetings] = useState([]);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [newTime, setNewTime] = useState('');
    const [showRejectPopup, setShowRejectPopup] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [meetingToReject, setMeetingToReject] = useState(null);
    const [activeTab, setActiveTab] = useState('pending');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchMeetings = async () => {
            setLoading(true);
            try {
                // Use different endpoints based on the active tab
                const endpoint = activeTab === 'pending' ? 'pending' : 'rejected';
                const response = await axios.get(`${backendurl}/meeting/instructor/${endpoint}/${instructorId}`);
                setMeetings(response.data || []);
            } catch (error) {
                console.error('Error fetching meetings:', error);
                toast.error(`Failed to fetch ${activeTab} meetings`);
                setMeetings([]); // Set empty array on error
            } finally {
                setLoading(false);
            }
        };
        fetchMeetings();
    }, [backendurl, instructorId, activeTab]);

    const handleSchedule = (meeting) => {
        setSelectedMeeting(meeting);
    };

    const handleConfirmSchedule = async () => {
        if (!newTime) {
            toast.error('Please select a time for the meeting');
            return;
        }

        try {
            await axios.put(`${backendurl}/meeting/${selectedMeeting._id}`, {
                action: 'schedule',
                time: newTime,
            });
            
            // Refresh the meetings list
            const response = await axios.get(`${backendurl}/meeting/instructor/pending/${instructorId}`);
            setMeetings(response.data || []);
            setSelectedMeeting(null);
            setNewTime('');
            toast.success('Meeting scheduled successfully');
        } catch (error) {
            console.error('Error scheduling meeting:', error);
            toast.error('Failed to schedule meeting');
        }
    };

    const handleReject = (meeting) => {
        setMeetingToReject(meeting);
        setShowRejectPopup(true);
        setRejectionReason('');
    };

    const handleConfirmReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error('Please provide a reason for rejection');
            return;
        }

        try {
            await axios.put(`${backendurl}/meeting/${meetingToReject._id}`, {
                action: 'reject',
                rejectionReason: rejectionReason.trim()
            });

            // Refresh the meetings list based on active tab
            const endpoint = activeTab === 'pending' ? 'pending' : 'rejected';
            const response = await axios.get(`${backendurl}/meeting/instructor/${endpoint}/${instructorId}`);
            setMeetings(response.data || []);
            setShowRejectPopup(false);
            setMeetingToReject(null);
            setRejectionReason('');
            toast.success('Meeting request rejected');
        } catch (error) {
            console.error('Error rejecting meeting:', error);
            toast.error('Failed to reject meeting');
        }
    };

    return (
        <div className="meeting-requests-container">
            <div className="meetings-tabs">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        className={`meetings-tab-btn${activeTab === tab.key ? ' active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="meeting-requests-scrollable">
                {loading ? (
                    <div className="meetings-loading">Loading meetings...</div>
                ) : meetings.length === 0 ? (
                    <div className="no-meeting-requests">
                        {activeTab === 'pending' ? 'No Pending Meeting Requests' : 'No Rejected Meetings'}
                    </div>
                ) : (
                    meetings.map((meeting) => (
                        <div className="meeting-request-card" key={meeting._id}>
                            <div className="meeting-request-info">
                                <div className="meeting-request-avatar">
                                    <img
                                        src={meeting.learner_id?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg'}
                                        alt={meeting.learner_id?.name || 'Learner'}
                                    />
                                </div>
                                <div className="meeting-request-details">
                                    <div className="meeting-request-name">{meeting.learner_id?.name || 'Unknown Learner'}</div>
                                    <div className="meeting-request-degree">B.Tech - Computer<br />M.Tech - Computer</div>
                                    <div className="meeting-request-id">{meeting.learner_id?.email || 'No email provided'}</div>
                                    <div className="meeting-request-date-time-row">
                                        <span className="meeting-request-date">{new Date(meeting.time).toLocaleDateString()}</span>
                                        <span className="meeting-request-time">{new Date(meeting.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="meeting-request-subject"><b>Subject:</b> {meeting.subject || 'No subject'}</div>
                                    <div className="meeting-request-topic"><b>Topic:</b> {meeting.topic || 'No topic'}</div>
                                    {activeTab === 'rejected' && (
                                        <div className="meeting-rejection-reason">
                                            <b>Rejection Reason:</b> {meeting.rejectionReason || 'No reason provided'}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {activeTab === 'pending' && (
                                <div className="meeting-request-actions">
                                    <button className="schedule-btn" onClick={() => handleSchedule(meeting)}>
                                        Schedule
                                    </button>
                                    <button className="reject-btn" onClick={() => handleReject(meeting)}>
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Schedule Meeting Popup */}
            <Popup open={selectedMeeting !== null} onClose={() => setSelectedMeeting(null)}>
                <div className="popup-dark">
                    <h3>Schedule Meeting</h3>
                    <input
                        type="datetime-local"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className="popup-dark-input"
                    />
                    <div className="popup-actions">
                        <button className="cancel-btn" onClick={() => setSelectedMeeting(null)}>
                            Cancel
                        </button>
                        <button className="schedule-btn" onClick={handleConfirmSchedule}>
                            Confirm Schedule
                        </button>
                    </div>
                </div>
            </Popup>

            {/* Reject Meeting Popup */}
            <Popup open={showRejectPopup} onClose={() => setShowRejectPopup(false)}>
                <div className="popup-dark">
                    <h3>Reject Meeting Request</h3>
                    <p className="rejection-note">Please provide a reason for rejection:</p>
                    <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Enter rejection reason..."
                        className="popup-dark-input rejection-reason-input"
                        rows="4"
                    />
                    <div className="popup-actions">
                        <button className="cancel-btn" onClick={() => setShowRejectPopup(false)}>
                            Cancel
                        </button>
                        <button className="reject-btn" onClick={handleConfirmReject}>
                            Confirm Reject
                        </button>
                    </div>
                </div>
            </Popup>
        </div>
    );
};

export default InsMeetingRequest;
