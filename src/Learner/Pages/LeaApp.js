import React, { useState } from 'react';
import LeaDashboard from '../Components/LeaDashboard';
import Logout from '../../Common/Logout'
import LeaDiscussionForum from '../Components/LeaDiscussionForum';
import LeaMakeRequest from '../Components/LeaMakeRequest';
import Logo from '../../Utility/Images/Logo.png'

import './LeaApp.css';
import LeaMeetings from '../Components/LeaMeetings';
import LeaLearnAI from '../Components/LeaLearnAI';

const LeaApp = () => {
  const [activeComponent, setActiveComponent] = useState('Dashboard'); 

  // Function to render the component based on the active menu option
  const renderComponent = () => {
    switch (activeComponent) {
      case 'Dashboard':
        return <LeaDashboard />;
      case 'Make Request':
        return <LeaMakeRequest />
      case 'Meetings':
        return <LeaMeetings />
      case 'Logout':
        return <Logout />;
      case 'Discussion Forum':
        return <LeaDiscussionForum />;
      case 'LearnAI':
        return <LeaLearnAI />
      default:
        return <LeaDashboard />;
    }
  };

  return (
    <div className="l-dashboard">
      <div className="l-menu">
      <div className="l-logo">
          <img src={Logo} alt="Logo" />
        </div>
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

      <div className="l-content">
        {renderComponent()}
      </div>
    </div>
  );
};

export default LeaApp;

