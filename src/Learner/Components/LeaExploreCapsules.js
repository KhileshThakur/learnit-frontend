import React, { useEffect, useState } from "react";
import "./LeaExploreCapsules.css"; // Make sure this CSS file exists or adjust accordingly

const ExploreCapsules = ({ learnerId }) => {
  const backenduri = process.env.REACT_APP_BACKEND;
  const [capsules, setCapsules] = useState([]);
  const [selectedCapsule, setSelectedCapsule] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchCapsules = async () => {
      try {
        const res = await fetch(`${backenduri}/learner/capsule/explore`, {
          method: "GET"
        });
        const data = await res.json();
        console.log("Fetched Capsules:", data); // Debug output
        setCapsules(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching capsules:", err);
      }
    };

    fetchCapsules();
  }, []);

  const handleJoin = async (capsuleId, learnerId) => {
    try {
      const res = await fetch(`${backenduri}/learner/capsule/request/${capsuleId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ learnerId })
      });
  
      const data = await res.json();
      setMessage(data.message || "Request sent.");
    } catch (err) {
      console.error("Join request error:", err);
      setMessage("Something went wrong.");
    }
  };
  

  return (
    <div className="explore-container">
      <h2 className="explore-title">Explore Capsules</h2>
      {message && <p className="status-message">{message}</p>}

      {capsules.length === 0 && <p>No capsules available.</p>}

      <div className="capsule-list">
        {capsules.map((capsule) => (
          <div key={capsule._id} className="capsule-card">
            <h3>{capsule.name}</h3>
            <p className="capsule-desc">{capsule.description}</p>
            <div className="card-actions">
              <button onClick={() => setSelectedCapsule(capsule)}>Details</button>
              <button onClick={() => handleJoin(capsule._id, learnerId)}>Join</button>
            </div>
          </div>
        ))}
      </div>

      {selectedCapsule && (
        <div className="capsule-popup">
          <div className="popup-content">
            <button className="close-btn" onClick={() => setSelectedCapsule(null)}>×</button>
            <h3>{selectedCapsule.name}</h3>
            <p>{selectedCapsule.description}</p>
            <p><strong>Start:</strong> {new Date(selectedCapsule.startDate).toLocaleDateString()}</p>
            <p><strong>End:</strong> {new Date(selectedCapsule.endDate).toLocaleDateString()}</p>
            <div>
              <strong>Schedule:</strong>
              <ul>
                {selectedCapsule.schedule?.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExploreCapsules;
