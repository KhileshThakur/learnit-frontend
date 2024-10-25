import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import JoinAsLearner from './Components/JoinAsLearner';
import JoinAsInstructor from './Components/JoinAsInstructor';
import './Login.css';

const Login = () => {
  const [role, setRole] = useState('Select Role');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedOption, setSelectedOption] = useState('authenticate');

  const handleLogin = (e) => {
    e.preventDefault();
    // Add login logic 
    console.log('Logging in:', { role, username, password });
  };

  const renderContent = () => {
    switch (selectedOption) {
      case 'learner':
        return <JoinAsLearner />;
      case 'instructor':
        return <JoinAsInstructor />;
      case 'authenticate':
      default:
        return (
          <Login />
        );
    }
  };

  return (
    <div className="full-page">

      <div className="button-group-container">
          <button
            className={`auth-btn ${selectedOption === 'authenticate' ? 'active' : ''}`}
            onClick={() => setSelectedOption('authenticate')}
          >
            Authenticate
          </button>
          <button
            className={`auth-btn ${selectedOption === 'learner' ? 'active' : ''}`}
            onClick={() => setSelectedOption('learner')}
          >
            Join as Learner
          </button>
          <button
            className={`auth-btn ${selectedOption === 'instructor' ? 'active' : ''}`}
            onClick={() => setSelectedOption('instructor')}
          >
            Join as Instructor
          </button>
        {/* </div> */}
      </div>

      <div className="content-container">
        {renderContent()}
      </div>

      {selectedOption === 'authenticate' && (
        <>
        <div className="register-links">
          <p>Don’t have an account? <Link to="/register-learner">Join as Learner</Link> or <Link to="/register-instructor">Join as Instructor</Link></p>
        </div>
        </>
      )} 
    </div>
  );
};

export default Login;
