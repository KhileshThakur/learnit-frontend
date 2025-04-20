import React, { useEffect, useState } from "react";
import Capsule from "./Capsule";
import "./MyCapsule.css";

const MyCapsules = ({ instructorId }) => {

  const backenduri = process.env.REACT_APP_BACKEND;

  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCapsule, setSelectedCapsule] = useState(null);

  useEffect(() => {
    const fetchCapsules = async () => {
      try {
        const response = await fetch(`${backenduri}/instructor/capsules/${instructorId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to fetch capsules");
        setCapsules(data.capsules || data || []);
      } catch (err) {
        console.error("Error fetching capsules:", err);
        setError("Failed to load capsules.");
      } finally {
        setLoading(false);
      }
    };

    fetchCapsules();
  }, [instructorId]);

  if (loading) return <p className="loading-message">Loading capsules...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return selectedCapsule ? (
    <Capsule capsule={selectedCapsule} onBack={() => setSelectedCapsule(null)} />
  ) : (
    <div className="capsules-container">
      <h2 className="capsules-title">My Capsules</h2>
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

export default MyCapsules;
