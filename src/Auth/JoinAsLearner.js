import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from './AuthHeader';
import './JoinAsLearner.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const JoinAsLearner = () => {
  const navigate = useNavigate();

  const backenduri = process.env.REACT_APP_BACKEND;

  const [university, setUniversity] = useState('');
  const [college, setCollege] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  }

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
    return <option value="" disabled>Select College</option>;
  };

  const sendOtp = async () => {
    setLoading(true);
    const email = document.getElementById('email').value;
    const response = await fetch(`${backenduri}/learner/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      setIsOtpSent(true);
      toast.success('OTP sent successfully! Please check your email.');
    } else {
      toast.error('Error sending OTP. Please try again.');
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    setLoading(true);
    const email = document.getElementById('email').value;
    const response = await fetch(`${backenduri}/learner/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    if (response.ok) {
      toast.success('OTP verified successfully!');
      setOtpVerified(true);
    } else {
      toast.error('Invalid OTP. Please try again.');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      name: document.getElementById('name').value,
      gender: document.querySelector('input[name="gender"]:checked').value,
      dob: document.getElementById('dob').value,
      phone: document.getElementById('phone').value,
      email: document.getElementById('email').value,
      college,
      university,
      department: document.getElementById('department').value,
      gradYear: document.getElementById('grad-year').value,
      subjects: document.getElementById('subjects').value.split(','),
      linkedin: document.getElementById('linkedin').value,
      portfolio: document.getElementById('portfolio').value,
      password: document.getElementById('password').value,
    };

    // Submit form data to backend
    if (otpVerified === true) {
      const response = await fetch(`${backenduri}/learner/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Account created successfully!', {
          onClose: () => navigate('/auth') // Redirect after the toast closes
        });
      } else {
        toast.error('Error creating account. Please try again.');
      }
    }
    else {
      toast.warn("Verify Email First");
    }


  };

  return (
    <div className="full-page">
      <AuthHeader />
      <h4 className="subtitle">Ready to Grow? Create an account and start Learning!</h4>
      <div className="learner-container">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="column">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" required />
            </div>
            <div className="column">
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

          <div className="row-email">
            <div className="column">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" required />
            </div>
            <div className="column">
              <label htmlFor="otp">OTP</label>
              <div className="button-container">
                <button type="button" className="sent-otp-btn" onClick={sendOtp} disabled={loading}>
                  Send OTP
                </button>
                <input type="text" id="otp" name="otp" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                <button type="button" className="verify-btn" onClick={verifyOtp} disabled={loading || !isOtpSent}>
                  Verify OTP
                </button>
              </div>
            </div>
          </div>
          <hr className="separation-line" />

          <div className="row-checkbox">
            <input type="checkbox" name="checkbox" id="checkbox" defaultChecked />
            Engineering
          </div>

          <div className="row">
            <div className="column">
              <label htmlFor="university">University</label>
              <select id="university" value={university} onChange={handleUniversityChange} required>
                <option value="" disabled hidden>Select University</option>
                <option value="pune">Pune University</option>
                <option value="mumbai">Mumbai University</option>
              </select>
            </div>
            <div className="column">
              <label htmlFor="college">College</label>
              <select id="college" value={college} onChange={(e) => setCollege(e.target.value)} required>
                <option value="" disabled hidden>Select College</option>
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
          <div className="row-password">
            <label htmlFor="password">Create Password</label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              style={{ marginLeft: '8px' }}
            >
              {showPassword ? "Hide" : "Show"} Password
            </button>
          </div>

          <div className="row">
            <button type="submit">Generate Account</button>
          </div>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default JoinAsLearner;
