// import React from 'react';
// import AuthHeader from './AuthHeader';

// const JoinAsLearner = () => {
//     return (
//         <div className="full-page">
//             <AuthHeader />
//             <h2>Join As Learner</h2>
//             {/* Add learner registration logic here */}
//         </div>
//     );
// };

// export default JoinAsLearner;

import React, { useState } from 'react';
import AuthHeader from './AuthHeader';
import './JoinAsLearner.css'; // Ensure this file contains the appropriate styling

const JoinAsLearner = () => {
  const [university, setUniversity] = useState('');
  const [college, setCollege] = useState('');

  const handleUniversityChange = (e) => {
    setUniversity(e.target.value);
    setCollege(''); // Reset college when university changes
  };

  const collegeOptions = () => {
    if (university === 'pune') {
      return (
        <>
          <option value="pict">PICT</option>
          <option value="dypatil">D Y Patil</option>
        </>
      );
    } else if (university === 'mumbai') {
      return (
        <>
          <option value="vjti">VJTI</option>
          <option value="kjsomaiya">K J Somaiya</option>
        </>
      );
    }
    return <option value="" disabled>Select College</option>; // Placeholder when no university selected
  };

  return (
    <div className="full-page">
            <AuthHeader />
            <div className="content-container">
    <form>
      <div className="row">
        <div className="column">
          <label htmlFor="name">Name</label>
          <input type="text" id="name" name="name" required />
        </div>
        <div className="column">
          <label>Gender</label>
          <div className="radio-group">
            <label><input type="radio" name="gender" value="Male" required /> Male</label>
            <label><input type="radio" name="gender" value="Female" required /> Female</label>
            <label><input type="radio" name="gender" value="Other" required /> Other</label>
          </div>
        </div>
        <div className="column">
          <label htmlFor="dob">DOB</label>
          <input type="date" id="dob" name="dob" required />
        </div>
        <div className="column">
          <label htmlFor="phone">Phone No.</label>
          <input type="number" id="phone" name="phone" required />
        </div>
      </div>

      <div className="row">
        <div className="column">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div className="column">
          <label htmlFor="otp">OTP</label>
          <div className="button-container">
            <input type="text" id="otp" name="otp" />
            <button type="button" className="verify-btn">Verify</button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="column">
          <label htmlFor="university">University</label>
          <select id="university" value={university} onChange={handleUniversityChange} required>
            <option value="" disabled hidden>Select University</option> {/* Placeholder */}
            <option value="pune">Pune University</option>
            <option value="mumbai">Mumbai University</option>
          </select>
        </div>
        <div className="column">
          <label htmlFor="college">College</label>
          <select id="college" value={college} onChange={(e) => setCollege(e.target.value)} required>
            <option value="" disabled hidden>Select College</option> {/* Placeholder */}
            {collegeOptions()}
          </select>
        </div>
        <div className="column">
          <label htmlFor="department">Department</label>
          <input type="text" id="department" name="department" required />
        </div>
        <div className="column">
          <label htmlFor="grad-year">Graduation Year</label>
          <input type="text" id="grad-year" name="grad-year" required />
        </div>
      </div>

      <div className="row">
        <div className="column">
          <label htmlFor="subjects">Interested Subjects (comma separated)</label>
          <input type="text" id="subjects" name="subjects" />
        </div>
        <div className="column">
          <label htmlFor="linkedin">LinkedIn URL</label>
          <input type="url" id="linkedin" name="linkedin" />
        </div>
        <div className="column">
          <label htmlFor="portfolio">Portfolio Link</label>
          <input type="url" id="portfolio" name="portfolio" />
        </div>
      </div>

      <div className="row">
        <button type="submit">Generate Account</button>
      </div>
    </form>
    </div>
    </div>
  );
};

export default JoinAsLearner;
