import React, { useEffect, useState } from "react";
import "./ViewRequests.css"; // Optional: Style as needed

const ViewRequests = ({ capsuleId }) => {
  const [requests, setRequests] = useState([]);
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/instructor/capsule/requests/${capsuleId}`);
        const data = await res.json();
        setRequests(data);
      } catch (err) {
        console.error("Error fetching requests:", err);
      }
    };

    if (capsuleId) {
      fetchRequests();
    }
  }, [capsuleId]);

  const handleAction = async (learnerId, action) => {
    try {
      const res = await fetch(`http://localhost:5000/api/instructor/capsule/handle-request/${capsuleId}/${learnerId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      setMessage(data.message);
      setRequests((prev) =>
        prev.map((r) =>
          r.learner._id === learnerId ? { ...r, status: action } : r
        )
      );
    } catch (err) {
      console.error("Error handling request:", err);
    }
  };

  return (
    <div className="view-requests-container">
      <h3>Join Requests</h3>
      {message && <p className="status-message">{message}</p>}

      {requests.length === 0 ? (
        <p>No join requests.</p>
      ) : (
        <ul className="request-list">
          {requests.map((r) => (
            <li key={r.learner._id} className="request-item">
              <div>
                <strong>{r.learner.name}</strong> ({r.learner.email}) - <em>{r.status}</em>
              </div>
              <div className="action-buttons">
                <button onClick={() => setSelectedLearner(r.learner)}>View Details</button>
                {r.status === "pending" && (
                  <>
                    <button onClick={() => handleAction(r.learner._id, "accepted")}>Accept</button>
                    <button onClick={() => handleAction(r.learner._id, "rejected")}>Reject</button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {selectedLearner && (
        <div className="learner-popup">
          <div className="popup-content">
            <button className="close-btn" onClick={() => setSelectedLearner(null)}>×</button>
            <h4>Learner Details</h4>
            <p><strong>Name:</strong> {selectedLearner.name}</p>
            <p><strong>Email:</strong> {selectedLearner.email}</p>
            {/* Add more learner fields here if needed */}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewRequests;
