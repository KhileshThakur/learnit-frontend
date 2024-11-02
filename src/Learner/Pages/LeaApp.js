import React, { useState } from 'react';
import LeaDashboard from '../Components/LeaDashboard';
import LeaLogout from '../Components/LeaLogout';
import LeaDiscussionForum from '../Components/LeaDiscussionForum';


import './LeaApp.css'; 

const LeaApp = () => {
  // State to keep track of the active component
  const [activeComponent, setActiveComponent] = useState('Dashboard'); // 'Dashboard' is default

  // Function to render the component based on the active menu option
  const renderComponent = () => {
    switch (activeComponent) {
      case 'Dashboard':
        return <LeaDashboard />;
      case 'Logout':
        return <LeaLogout />;
      case 'Discussion Forum':
        return <LeaDiscussionForum />;
      // Add cases for other menu options and components
      default:
        return <LeaDashboard />;
    }
  };

  return (
    <div className="l-dashboard">
      {/* Left Menu Sidebar */}
      <div className="l-menu">
        <ul>
          {['Dashboard', 'Make Request', 'Meetings', 'Explore Courses', 'Enrolled Courses', 'LearnAI', 
           'Discussion Forum', 'Explore Capsules', 'Capsule Requests', 'My Capsules', 'Logout'].map((item) => (
            <li 
              key={item} 
              onClick={() => setActiveComponent(item)} 
              className={activeComponent === item ? 'active' : ''}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Content Display Area */}
      <div className="l-content">
        {renderComponent()}
      </div>
    </div>
  );
};

export default LeaApp;

