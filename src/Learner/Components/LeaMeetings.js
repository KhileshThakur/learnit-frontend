// LeaMeetings.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './LeaMeetings.css';

const LeaMeetings = () => {
    const backendurl = process.env.REACT_APP_BACKEND;
    const { id: learnerId } = useParams();
    const [meetings, setMeetings] = useState([]);
    const [status, setStatus] = useState('scheduled');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMeetings = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${backendurl}/meeting/${status}`, {
                    params: { learner_id: learnerId }
                });
                setMeetings(response.data);
            } catch (error) {
                console.error('Error fetching meetings:', error);
                setError('Failed to load meetings. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchMeetings();
    }, [status, backendurl, learnerId]);

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).replace(/\//g, '/'),
            time: date.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }).toLowerCase()
        };
    };

    const formatQualification = (instructor) => {
        const qualifications = [];
        if (instructor?.qualification?.gdegree) {
            qualifications.push(`${instructor.qualification.gdegree}`);
        }
        if (instructor?.qualification?.pdegree) {
            qualifications.push(`${instructor.qualification.pdegree}`);
        }
        return qualifications.map(qual => {
            const parts = qual.split(' ');
            const degree = parts[0];
            const stream = parts.slice(1).join(' ');
            return `${degree} - ${stream}`;
        }).join('\n');
    };

    return (
        <div className="lea-meetings-container">
            <div className="lea-meetings-tabs">
                <button
                    className={`lea-meetings-tab${status === 'scheduled' ? ' active' : ''}`}
                    onClick={() => setStatus('scheduled')}
                >
                    Scheduled
                </button>
                <button
                    className={`lea-meetings-tab${status === 'rejected' ? ' active' : ''}`}
                    onClick={() => setStatus('rejected')}
                >
                    Rejected
                </button>
                <button
                    className={`lea-meetings-tab${status === 'pending' ? ' active' : ''}`}
                    onClick={() => setStatus('pending')}
                >
                    Pending Request
                </button>
            </div>

            {loading && <p className="lea-meetings-loading">Loading meetings...</p>}
            {error && <p className="lea-meetings-error">{error}</p>}
            
            <div className="lea-meetings-card-list">
                {meetings.length > 0 ? (
                    meetings.map((meeting) => (
                        <div className={`lea-meeting-card lea-meeting-${status}`} key={meeting._id}>
                            <div className="lea-meeting-card-left">
                                <img
                                    src={`${process.env.PUBLIC_URL}/default-profile.png`}
                                    alt={meeting.instructor_id?.name}
                                    className="lea-meeting-avatar"
                                />
                                <div className="lea-meeting-instructor-info">
                                    <h3 className="lea-meeting-instructor-name">
                                        {meeting.instructor_id?.name}
                                    </h3>
                                    <p className="lea-meeting-instructor-qual">
                                        {formatQualification(meeting.instructor_id)}
                                    </p>
                                </div>
                            </div>

                            <div className="lea-meeting-center">
                                {status === 'scheduled' && (
                                    <>
                                        <p className="lea-meeting-date">Date: {formatDateTime(meeting.time).date}</p>
                                        <p className="lea-meeting-time">Time: {formatDateTime(meeting.time).time}</p>
                                    </>
                                )}
                                {status === 'rejected' && meeting.rejectReason && (
                                    <div className="lea-meeting-reject-reason">
                                        {meeting.rejectReason}
                                    </div>
                                )}
                                {status === 'pending' && (
                                    <div className="lea-meeting-status-label">Request Pending</div>
                                )}
                            </div>

                            <div className="lea-meeting-card-right">
                                {status === 'scheduled' && (
                                    <button className="lea-meeting-status-btn join">
                                        Join Meet
                                    </button>
                                )}
                                {status === 'rejected' && (
                                    <button className="lea-meeting-status-btn rejected">
                                        Rejected
                                    </button>
                                )}
                                {status === 'pending' && (
                                    <button className="lea-meeting-status-btn pending">
                                        Pending
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="lea-meetings-empty">No {status} meetings found.</p>
                )}
            </div>
        </div>
    );
};

export default LeaMeetings;
