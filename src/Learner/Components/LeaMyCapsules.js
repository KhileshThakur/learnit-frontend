import React, { useEffect, useState } from "react";
import Capsule from "./TimeCapsule/Capsule"; // Reuse the existing Capsule component
import "./LeaMyCapsules.css"; // Same styling as instructor

const LeaMyCapsules = ({ learnerId }) => {
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCapsule, setSelectedCapsule] = useState(null);

  useEffect(() => {
    const fetchAcceptedCapsules = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/learner/capsule/my-capsule/${learnerId}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch capsules");
        setCapsules(data || []);
      } catch (err) {
        console.error("Error fetching accepted capsules:", err);
        setError("Failed to load accepted capsules.");
      } finally {
        setLoading(false);
      }
    };

    fetchAcceptedCapsules();
  }, [learnerId]);

  if (loading) return <p className="loading-message">Loading capsules...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return selectedCapsule ? (
    <Capsule learnerId={learnerId} capsule={selectedCapsule} onBack={() => setSelectedCapsule(null) } />
  ) : (
    <div className="capsules-container">
      <h2 className="capsules-title">My Joined Capsules</h2>
      <div className="capsule-scroll">
        {capsules.map((capsule) => (
          <div
            key={capsule._id}
            className="capsule-card"
            onClick={() => setSelectedCapsule(capsule)}
          >
            <h3 className="capsule-name">{capsule.name}</h3>
            <p className="capsule-description">{capsule.description}</p>
            <p className="capsule-date">Start: {new Date(capsule.startDate).toLocaleDateString()}</p>
            <p className="capsule-date">End: {new Date(capsule.endDate).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaMyCapsules;
