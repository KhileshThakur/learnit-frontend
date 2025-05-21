import React from "react";
import "./CapsuleDetails.css";

const CapsuleDetails = ({ capsule }) => {
  return (
    <div className="capsule-details">
      <p><strong>Description:</strong> {capsule.description}</p>
      <p><strong>Start Date:</strong> {new Date(capsule.startDate).toLocaleDateString()}</p>
      <p><strong>End Date:</strong> {new Date(capsule.endDate).toLocaleDateString()}</p>
      <div>
        <p><strong>Schedule:</strong></p>
        <ul>
          {capsule.schedule.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CapsuleDetails;
