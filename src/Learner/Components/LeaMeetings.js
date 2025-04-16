// LeaMeetings.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const LeaMeetings = () => {
    const backendurl = process.env.REACT_APP_BACKEND;
    const { id: learnerId } = useParams(); // Retrieve learner ID from the URL
    const [meetings, setMeetings] = useState([]);
    const [status, setStatus] = useState('pending'); // Default to Pending
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch meetings based on selected status and learner ID
    useEffect(() => {
        const fetchMeetings = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${backendurl}/meeting/${status}`, {
                    params: { learner_id: learnerId } // Send learner ID as a query parameter
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

    return (
        <div>
            <nav className="navbar">
                <button onClick={() => setStatus('pending')}>Pending</button>
                <button onClick={() => setStatus('scheduled')}>Scheduled</button>
                <button onClick={() => setStatus('cancelled')}>Cancelled</button>
            </nav>

            <h2>{status} Meetings</h2>
            
            {loading && <p>Loading meetings...</p>}
            {error && <p className="error">{error}</p>}
            
            {!loading && !error && (
                <ul>
                    {meetings.length > 0 ? (
                        meetings.map((meeting) => (
                            <li key={meeting._id}>
                                <strong>Subject:</strong> {meeting.subject} <br />
                                <strong>Topic:</strong> {meeting.topic} <br />
                                <strong>Time:</strong> {new Date(meeting.time).toLocaleString()} <br />
                                <strong>Instructor ID:</strong> {meeting.instructor_id} <br />
                                <strong>Status:</strong> {meeting.status}
                            </li>
                        ))
                    ) : (
                        <p>No {status} meetings found.</p>
                    )}
                </ul>
            )}

            <style jsx>{`
                .navbar {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                }
                button {
                    padding: 8px 16px;
                    border: none;
                    cursor: pointer;
                    background-color: #007bff;
                    color: white;
                    border-radius: 4px;
                }
                button:hover {
                    background-color: #0056b3;
                }
                .error {
                    color: red;
                }
            `}</style>
        </div>
    );
}

export default LeaMeetings;
