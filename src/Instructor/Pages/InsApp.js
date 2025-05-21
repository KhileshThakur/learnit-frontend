import React, { useState } from 'react'
import { useParams } from 'react-router-dom'

import InsDashboard from '../Components/InsDashboard'
import Logout from '../../Common/Logout'
import InsMeetingRequest from '../Components/InsMeetingRequest'
import MyCourses from '../Components/Courses/MyCourses'
import CreateCourse from '../Components/Courses/CreateCourse'
import CreateCapsule from '../Components/TimeCapsule/CreateCapsule'
import './InsApp.css'
import Logo from '../../Utility/Images/Logo.png'
import MyCapsules from '../Components/TimeCapsule/MyCapsules'
import InsLearnAI from '../Components/InsLearnAI'
import LeaDiscussionForum from '../../Learner/Components/DiscussionForum/LeaDiscussionForum'
import InsScheduledMeetings from '../Components/InsScheduledMeetings'

const InsApp = () => {

  const [activeComponent, setActiveComponent] = useState("Dashboard");
  const { id: instructorId } = useParams();

  const renderComponent = () => {
    switch (activeComponent) {
      case 'Dashboard':
        return <InsDashboard instructorId={instructorId} />
      case 'Meeting Requests':
        return <InsMeetingRequest />
      case 'Scheduled Meetings':
        return <InsScheduledMeetings />
      case 'My Courses':
        return <MyCourses instructorId={instructorId}/>
      case 'Create Course':
        return <CreateCourse instructorId={instructorId}/>
      case 'LearnAI':
        return <InsLearnAI />
      case 'Discussion Forum':
        return <LeaDiscussionForum />
      case 'Create Capsule':
        return <CreateCapsule instructorId={instructorId}/>
      case 'My Capusule':
        return <MyCapsules instructorId={instructorId} />
      case 'Logout':
        return <Logout />;
      default:
        return <InsDashboard />;
    }
  };

  return (
    <div className="i-dashboard">
      <div className="i-menu">
        <div className="i-logo">
          <img src={Logo} alt="Logo" />
        </div>
        <ul>
          {['Dashboard', 'Meeting Requests', 'Scheduled Meetings', 'My Courses', 'Create Course', 'LearnAI', 'Discussion Forum', 'Create Capsule', 'My Capusule', 'Logout'].map((item) => (
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
      <div className="i-content">
        {renderComponent()}
      </div>
    </div>
  )
}

export default InsApp
