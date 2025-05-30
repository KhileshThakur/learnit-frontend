import React, { useState } from "react";
import axios from "axios";
import "./CreateMeeting.css"; 


const CreateMeeting = ({ capsuleId }) => {
  const backenduri = process.env.REACT_APP_BACKEND;
  const [roomName, setRoomName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [joinUrl, setJoinUrl] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Validate the scheduledFor field
    if (!scheduledFor) {
      setError("Please select a scheduled time.");
      return;
    }

    try {
      // Step 1: Create room using the external API (POST to https://meet-up-server-xklt.onrender.com/create-meet)
      const createRoomResponse = await axios.post(
        "https://meet-up-server-xklt.onrender.com/create-meet"
      );

      if (createRoomResponse.data.success) {
        // Extract room details from the response
        const { roomName, roomId, joinUrl } = createRoomResponse.data;

        // Step 2: Send the room details and scheduled time to your backend API
        const meetingData = {
          capsuleId,
          roomName,
          roomId,
          joinUrl,
          scheduledFor
        };

        const saveMeetingResponse = await axios.post(
          `${backenduri}/instructor/capsule/meeting/save`,
          meetingData
        );

        if (saveMeetingResponse.data.success) {
          setSuccessMessage("Meeting created and saved successfully!");
          setRoomName("");
          setRoomId("");
          setJoinUrl("");
          setScheduledFor("");
        } else {
          setError("Error saving meeting. Please try again.");
        }
      } else {
        setError("Error creating the meeting room. Please try again.");
      }
    } catch (err) {
      setError("An error occurred while creating the meeting. Please try again.");
      console.error("Error:", err);
    }
  };

  return (
    <div className="create-meeting-container">
      <h2>Create a Meeting for Capsule</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="scheduledFor">Scheduled For</label>
          <input
            type="datetime-local"
            id="scheduledFor"
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
            required
          />
        </div>

        <button type="submit">Create and Save Meeting</button>
      </form>
    </div>
  );
};

export default CreateMeeting;
