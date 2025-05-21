import React, { useEffect, useState } from "react";
import axios from "axios";

const ScheduledMeetings = ({ capsuleId }) => {
  const backenduri = process.env.REACT_APP_BACKEND;
  const [meetings, setMeetings] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const res = await axios.get(
          `${backenduri}/instructor/capsule/meeting/${capsuleId}`
        );
        if (res.data.success) {
          setMeetings(res.data.meetings);
        } else {
          setError("Failed to fetch meetings.");
        }
      } catch (err) {
        console.error("Error fetching meetings:", err);
        setError("Something went wrong.");
      }
    };

    fetchMeetings();
  }, [capsuleId,backenduri]);

  return (
    <div className="scheduled-meetings">
      

      {error && <p className="error-message">{error}</p>}

      {meetings.length === 0 && <p className="no-meetings">No meetings scheduled yet.</p>}

      <ul className="meeting-list">
        {meetings.map((meeting, index) => (
          <li key={index} className="meeting-card">
            <p><strong>Date & Time:</strong> {new Date(meeting.scheduledFor).toLocaleString()}</p>
            <p><strong>Room Name:</strong> {meeting.roomName}</p>
            <p><strong>Join Link:</strong> <a href={meeting.joinUrl} target="_blank" rel="noopener noreferrer">{meeting.joinUrl}</a></p>
            <details>
              <summary className="how-to-join">How to Join</summary>
              <ul>
                <li>Click on the join link above.</li>
                <li>A new page will open.</li>
                <li>Switch to the "Join" tab.</li>
                <li>Paste the <strong>Room Name</strong>.</li>
                <li>Enter your name and join.</li>
              </ul>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ScheduledMeetings;
