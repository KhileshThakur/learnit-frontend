import React, { useState } from "react";
import CapsuleDetails from "./CapsuleDetails";
import Participants from "./Participants";
import ScheduledMeetings from "./ScheduledMeetings";
import Resources from "./Resources";
import "./Capsule.css";

const Capsule = ({learnerId , capsule, onBack}) => {
  const [activeTab, setActiveTab] = useState("details");

  const tabs = [
    { id: "details", label: "Details" },
    { id: "participants", label: "Participants" },
    { id: "resources", label: "Resources" },
    { id: "scheduled-meetings", label: "Scheduled Meetings" }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "details":
        return <CapsuleDetails capsule={capsule._id}  learnerId={learnerId}/>;
      case "participants":
        return <Participants capsuleId={capsule._id} learnerId={learnerId}/>;
      case "resources":
        return <Resources capsuleId={capsule._id} learnerId={learnerId}/>;
      case "scheduled-meetings":
        return <ScheduledMeetings capsuleId={capsule._id} learnerId={learnerId}/>;
      default:
        return null;
    }
  };

  return (
    <div className="capsule-container">
      <button className="back-button" onClick={onBack}>
        ← Back to Capsules
      </button>

      <h2 className="capsule-title">{capsule.name}</h2>

      <div className="capsule-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="capsule-tab-content">{renderTabContent()}</div>
    </div>
  );
};

export default Capsule;
