import React from "react";

const CapsuleDetails = ({ learnerId, capsuleId }) => {
  return (
    <div>
      <h3>Capsule Details</h3>
      <p>CapsuleId ID: {capsuleId || "N/A"}</p>
      <p>Learner ID: {learnerId || "N/A"}</p>
    </div>
  );
};

export default CapsuleDetails;
