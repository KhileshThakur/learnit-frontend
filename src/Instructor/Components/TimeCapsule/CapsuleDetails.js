import React from "react";

const CapsuleDetails = ({ capsule }) => {
  return (
    <div>
      <p><strong>Description:</strong> {capsule.description}</p>
      <p><strong>Start Date:</strong> {new Date(capsule.startDate).toLocaleDateString()}</p>
      <p><strong>End Date:</strong> {new Date(capsule.endDate).toLocaleDateString()}</p>
      <div>
        <strong>Schedule:</strong>
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
