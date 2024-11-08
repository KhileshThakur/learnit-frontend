import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Popup from 'reactjs-popup'; // Ensure you have this library installed

const InsMeetingRequest = () => {
    const backendurl = process.env.REACT_APP_BACKEND;
    const {id: instructorId } = useParams(); // Get instructor ID from the URL
    const [meetings, setMeetings] = useState([]);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [newTime, setNewTime] = useState('');

    useEffect(() => {
        const fetchPendingMeetings = async () => {
            try {
                const response = await axios.get(`${backendurl}/meeting/pending/${instructorId}`);
                setMeetings(response.data);
            } catch (error) {
                console.error('Error fetching meetings:', error);
            }
        };
        fetchPendingMeetings();
    }, [backendurl, instructorId]);

    const handleSchedule = async (meeting) => {
        setSelectedMeeting(meeting);
    };

    const handleConfirmSchedule = async () => {
        try {
            await axios.put(`${backendurl}/meeting/${selectedMeeting._id}`, {
                action: 'schedule',
                time: newTime
            });
            // Refresh the meetings after updating
            const response = await axios.get(`${backendurl}/meeting/pending/${instructorId}`);
            setMeetings(response.data);
            setSelectedMeeting(null); // Close the popup
            setNewTime(''); // Reset the time input
        } catch (error) {
            console.error('Error scheduling meeting:', error);
        }
    };

    const handleCancel = async (meetingId) => {
        try {
            await axios.put(`${backendurl}/meeting/${meetingId}`, {
                action: 'cancel'
            });
            // Refresh the meetings after updating
            const response = await axios.get(`${backendurl}/meeting/pending/${instructorId}`);
            setMeetings(response.data);
        } catch (error) {
            console.error('Error cancelling meeting:', error);
        }
    };

    return (
        <div>
            <h2>Pending Meeting Requests</h2>
            <ul>
                {meetings.map((meeting) => (
                    <li key={meeting._id}>
                        <strong>Subject:</strong> {meeting.subject} <br />
                        <strong>Topic:</strong> {meeting.topic} <br />
                        <strong>Time:</strong> {meeting.time} <br />
                        <strong>Status:</strong> {meeting.status} <br />
                        <strong>Learner Name:</strong> {meeting.learner_id.name} <br />
                        <strong>Learner Email:</strong> {meeting.learner_id.email} <br />
                        <button onClick={() => handleSchedule(meeting)}>Schedule</button>
                        <button onClick={() => handleCancel(meeting._id)}>Cancel</button>
                    </li>
                ))}
            </ul>

            <Popup open={selectedMeeting !== null} onClose={() => setSelectedMeeting(null)}>
                <div>
                    <h3>Schedule Meeting</h3>
                    <input
                        type="datetime-local"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                    />
                    <button onClick={handleConfirmSchedule}>Confirm Schedule</button>
                </div>
            </Popup>
        </div>
    );
}

export default InsMeetingRequest;
