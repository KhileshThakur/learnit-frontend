import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthHeader from '../Auth/AuthHeader'
import './JoinAsInstructor.css'

const JoinAsInstructor = () => {

    const backenduri = process.env.REACT_APP_BACKEND;
    const navigate = useNavigate();

    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    }
    const sendOtp = async () => {
        setLoading(true);
        const email = document.getElementById('email').value;
        const response = await fetch(`${backenduri}/instructor/send-otp`, {
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
        const response = await fetch(`${backenduri}/instructor/verify-otp`, {
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


    const [name, setName] = useState('');
    const [gender, setGender] = useState('');
    const [dob, setDob] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [tenthpc, setTenthpc] = useState('');
    const [twelfthpc, setTwelfthpc] = useState('');
    const [diplomapc, setDiplomapc] = useState('');
    const [gdegree, setGdegree] = useState("");
    const [ginstitute, setGinstitute] = useState("");
    const [gyear, setGyear] = useState("");
    const [gpc, setGpc] = useState("");
    const [gresultFile, setGresultFile] = useState(null);
    const [pdegree, setPdegree] = useState("");
    const [pinstitute, setPinstitute] = useState("");
    const [pyear, setPyear] = useState("");
    const [ppc, setPpc] = useState("");
    const [presultFile, setPresultFile] = useState(null);
    const [expertise, setExpertise] = useState('');
    const [teachexp, setTeachexp] = useState('');
    const [linkedin, setLinkedin] = useState("");
    const [portfolio, setPortfolio] = useState("");
    const [resumeFile, setResumeFile] = useState(null);
    const [password, setPassword] = useState('');


    const handleGenderChange = (e) => {
        setGender(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (otpVerified === true) {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('gender', gender);
            formData.append('dob', dob);
            formData.append('phone', phone);
            formData.append('email', email);
            formData.append('qualification[tenthpc]', tenthpc);
            formData.append('qualification[twelfthpc]', twelfthpc);
            formData.append('qualification[diplomapc]', diplomapc);
            formData.append('graduation[gdegree]', gdegree);
            formData.append('graduation[ginstitute]', ginstitute);
            formData.append('graduation[gyear]', gyear);
            formData.append('graduation[gpc]', gpc);
            formData.append('gresult', gresultFile);
            formData.append('postgraduation[pdegree]', pdegree);
            formData.append('postgraduation[pinstitute]', pinstitute);
            formData.append('postgraduation[pyear]', pyear);
            formData.append('postgraduation[ppc]', ppc);
            formData.append('presult', presultFile);
            formData.append('expertise', expertise);
            formData.append('teachexp', teachexp);
            formData.append('linkedin', linkedin);
            formData.append('portfolio', portfolio);
            formData.append('resume', resumeFile);
            formData.append('password', password);


            try {
                await axios.post(`${backenduri}/instructor/register`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                toast.success('Details Submitted successfully!', {
                    onClose: () => navigate('/auth')
                });
            } catch (error) {
                toast.err('Something Went Wrong');
            }
        }
        else {
            toast.warn("Verify email first!")
        }
    };

    return (
        <div className="full-page">
            <AuthHeader />
            <h4 className="subtitle">Ready to Grow? Create an account and start Learning!</h4>
            <div className="instructor-container">
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="column">
                            <label>Name:</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>

                        <div className="column">
                            <div className="radio-group">
                                <label>
                                    <input
                                        type="radio"
                                        name="gender"
                                        value='Male'
                                        checked={gender === 'Male'}
                                        onChange={handleGenderChange}
                                        required
                                    />
                                    Male
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="gender"
                                        value='Female'
                                        checked={gender === 'Female'}
                                        onChange={handleGenderChange}
                                        required
                                    />
                                    Female
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="gender"
                                        value='Other'
                                        checked={gender === 'Other'}
                                        onChange={handleGenderChange}
                                        required
                                    />
                                    Other
                                </label>
                            </div>
                        </div>

                        <div className="column">
                            <label htmlFor="dob">DOB</label>
                            <input type="date" id="dob" name="dob" value={dob} onChange={(e) => setDob(e.target.value)} required />
                        </div>
                        <div className="column">
                            <label htmlFor="phone">Phone No.</label>
                            <input type="number" id="phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                        </div>
                    </div>
                    <div className="row-email">
                        <div className="column">
                            <label htmlFor="email">Email</label>
                            <input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
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

                    <h5 className="subheading">Qualifications</h5>
                    <div className="row-qualification">
                        <div className="column">
                            <label htmlFor="tenthpc">10th Percentage</label>
                            <input type="number" id="tenthpc" name="tenthpc" value={tenthpc} onChange={(e) => setTenthpc(e.target.value)} required />
                        </div>
                        <div className="column">
                            <label htmlFor="twelfthpc">12th Percentage</label>
                            <input type="number" id="twelfthpc" name="twelfthpc" value={twelfthpc} onChange={(e) => setTwelfthpc(e.target.value)} />
                        </div>
                        <div className="column">
                            <label htmlFor="diplomapc">Diploma Percentage</label>
                            <input type="number" id="diplomapc" name="diplomapc" value={diplomapc} onChange={(e) => setDiplomapc(e.target.value)} />
                        </div>
                    </div>

                    <h5 className="subheading">Graduation Details</h5>
                    <div className="row">
                        <div className="column">
                            <label htmlFor="gdegree">Degree</label>
                            <input type="text" id="gdegree" name="gdegree" value={gdegree} onChange={(e) => setGdegree(e.target.value)} required />
                        </div>
                        <div className="column">
                            <label htmlFor="ginstitute">Institution</label>
                            <input type="text" id="ginstitute" name="ginstitute" value={ginstitute} onChange={(e) => setGinstitute(e.target.value)} required />
                        </div>
                        <div className="column">
                            <label htmlFor="gyear">Year of Graduation</label>
                            <input type="number" id="gyear" name="gyear" value={gyear} onChange={(e) => setGyear(e.target.value)} required />
                        </div>
                        <div className="column">
                            <label htmlFor="gpc">Percentage</label>
                            <input type="number" id="gpc" name="gpc" value={gpc} onChange={(e) => setGpc(e.target.value)} required />
                        </div>
                    </div>
                    <div className="row">
                        <div className="column">
                            <label htmlFor="gresult">Upload Graduation Result</label>
                            <input type="file" name="gresult" id="gresult" accept="application/pdf" onChange={(e) => setGresultFile(e.target.files[0])} required />
                        </div>

                    </div>

                    <h5 className="subheading">Post Graduation Details</h5>
                    <div className="row">
                        <div className="column">
                            <label htmlFor="pdegree">Degree</label>
                            <input type="text" id="pdegree" name="pdegree" value={pdegree} onChange={(e) => setPdegree(e.target.value)} />
                        </div>
                        <div className="column">
                            <label htmlFor="pinstitute">Institution</label>
                            <input type="text" id="pinstitute" name="pinstitute" value={pinstitute} onChange={(e) => setPinstitute(e.target.value)} />
                        </div>
                        <div className="column">
                            <label htmlFor="pyear">Year of Post Graduation</label>
                            <input type="number" id="pyear" name="pyear" value={pyear} onChange={(e) => setPyear(e.target.value)} />
                        </div>
                        <div className="column">
                            <label htmlFor="ppc">Percentage</label>
                            <input type="number" id="ppc" name="ppc" value={ppc} onChange={(e) => setPpc(e.target.value)} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="column">
                            <label htmlFor="presult">Upload Post Graduation Result</label>
                            <input type="file" name="presult" id="presult" accept="application/pdf" onChange={(e) => setPresultFile(e.target.files[0])} />
                        </div>
                    </div>
                    <hr className="separation-line" />
                    <div className="row">
                        <div className="column">
                            <label htmlFor="expertise">Expertise in (comma separated):</label>
                            <input type="text" name="expertise" id="expertise" value={expertise} onChange={(e) => setExpertise(e.target.value)} required />
                        </div>

                        <div className="column">
                            <label htmlFor="teachexp">Teaching Experiece</label>
                            <input type="number" id="teachexp" name="teachexp" value={teachexp} onChange={(e) => setTeachexp(e.target.value)} required />
                        </div>
                    </div>
                    <div className="row-links">
                        <div className="column">
                            <label htmlFor="linkedin">LinkedIn URL</label>
                            <input type="url" id="linkedin" name="linkedin" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
                        </div>
                        <div className="column">
                            <label htmlFor="portfolio">Portfolio URL</label>
                            <input type="url" id="portfolio" name="portfolio" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} />
                        </div>
                        <div className="column">
                            <label htmlFor="resume">Upload Resume</label>
                            <input type="file" name="resume" id="resume" required accept="application/pdf" onChange={(e) => setResumeFile(e.target.files[0])} />
                        </div>
                    </div>
                    <div className="column">

                        <label htmlFor="password">Create Password</label>
                        <div className="row-password">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                onChange={(e) => setPassword(e.target.value)}
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
                    </div>
                    <hr className="separation-line" />
                    <div className="row-check">
                        <input type="checkbox" name="terms" id="terms" required />
                        <p>I certify that the information I have provided is accurate and complete. I understand that any false or misleading details may lead to the rejection of my application or future disqualification.</p>
                    </div>

                    <div className="row">
                        <button type="submit">Generate Account</button>
                    </div>
                </form>
                <ToastContainer />
            </div >
        </div >



    );
};

export default JoinAsInstructor;
