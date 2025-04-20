import React from "react";

const ScheduledMeetings = ({ capsuleId, learnerId }) => {
  return (
    <div>
      <h3>Scheduled Meetings</h3>
      <p>CapsuleId ID: {capsuleId || "N/A"}</p>
      <p>Learner ID: {learnerId || "N/A"}</p>

    </div>
  );
};

export default ScheduledMeetings;
