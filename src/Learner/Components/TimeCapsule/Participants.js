import React from "react";

const Participants = ({learnerId, capsuleId }) => {
  return (
    <div>
      <h3>Participants</h3>
      <p>Capsule ID: {capsuleId}</p>
      <p>Learner ID: {learnerId}</p>
    </div>
  );
};

export default Participants;
