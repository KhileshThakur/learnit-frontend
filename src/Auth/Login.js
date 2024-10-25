import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
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
          <form className="login-form" onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="Select Role" disabled>Select Role</option>
                <option value="learner">Learner</option>
                <option value="instructor">Instructor</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="forgot-password">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>

            <button type="submit" className="login-btn">Authenticate</button>
          </form>
        );
    }
  };

  return (
    <div className="full-page">

      <div className="button-group-container">
        {/* <div className="button-group"> */}
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
          <div className="divider">
            <span>Or Continue with</span>
          </div>

          <button className="google-login-btn">
            <Icon icon="flat-color-icons:google" className="google-icon" />
            Google
          </button>
     
        <div className="register-links">
          <p>Don’t have an account? <Link to="/register-learner">Join as Learner</Link> or <Link to="/register-instructor">Join as Instructor</Link></p>
        </div>
        </>
      )} 
    </div>
  );
};

export default Login;
