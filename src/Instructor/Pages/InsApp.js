import React, { useState } from 'react'
import { useParams } from 'react-router-dom'

import InsDashboard from '../Components/InsDashboard'
import Logout from '../../Common/Logout'
import InsMeetingRequest from '../Components/InsMeetingRequest'
import InstructorCourses from '../Components/Courses/InstructorCourses'
import CreateCourse from '../Components/Courses/CreateCourse'
import CreateCapsule from '../Components/TimeCapsule/CreateCapsule'
import './InsApp.css'
import Logo from '../../Utility/Images/Logo.png'
import MyCapsules from '../Components/TimeCapsule/MyCapsules'

const InsApp = () => {

  const [activeComponent, setActiveComponent] = useState("Dashboard");
  const { id: instructorId } = useParams();

  const renderComponent = () => {
    switch (activeComponent) {
      case 'Dashboard':
        return <InsDashboard />;
      case 'Meeting Requests':
        return <InsMeetingRequest />
      case 'Scheduled Meetings':
        return <InsMeetingRequest />
      case 'My Courses':
        return <InstructorCourses />
      case 'Create Course':
        return <CreateCourse onCourseCreated={() => setActiveComponent('My Courses')} />
      case 'LearnAI':
        return <InsMeetingRequest />
      case 'Discussion Forum':
        return <InsMeetingRequest />
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
