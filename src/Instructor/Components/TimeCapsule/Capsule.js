import React, { useState } from "react";
import CapsuleDetails from "./CapsuleDetails";
import ViewRequests from "./ViewRequests";
import Participants from "./Participants";
import ScheduledMeetings from "./ScheduledMeetings";
import CreateMeeting from "./CreateMeeting";
import "./Capsule.css";
import Resources from "./Resources";

const Capsule = ({ capsule, onBack }) => {

  const [activeTab, setActiveTab] = useState("details");

  const tabs = [
    { id: "details", label: "Details" },
    { id: "requests", label: "View Requests" },
    { id: "participants", label: "Participants" },
    { id: "create-meeting", label: "Create Meeting" },
    { id: "resources", label: "Resources" },
    { id: "scheduled-meetings", label: "Scheduled Meetings" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "details":
        return <CapsuleDetails capsule={capsule} />;
      case "requests":
        return <ViewRequests capsuleId={capsule._id} />;
      case "participants":
        return <Participants capsuleId={capsule._id} />;
      case "create-meeting":
        return <CreateMeeting capsuleId={capsule._id} />;
      case "scheduled-meetings":
        return <ScheduledMeetings capsuleId={capsule._id} />;
      case "resources":
        return <Resources capsuleId={capsule._id} />;
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
