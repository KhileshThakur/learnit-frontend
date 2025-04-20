import React from "react";

const Resources = ({ capsuleId, learnerId }) => {
  return (
    <div>
      <h3>Resources</h3>
      <p>CapsuleId ID: {capsuleId || "N/A"}</p>
      <p>Learner ID: {learnerId || "N/A"}</p>
    </div>
  );
};

export default Resources;
