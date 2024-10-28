import React from 'react';
import AuthHeader from './AuthHeader';
import './JoinAsInstructor.css'

const JoinAsInstructor = () => {
    return (
        <div className="full-page">
            <AuthHeader />
            <h4 className="subtitle">Start Your Teaching Adventure – Sign Up and Inspire </h4>
            <div className="instructor-container">
                <form >
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
                                <input type="text" id="otp" name="otp" />
                                <button type="button" className="verify-btn">Verify</button>
                            </div>
                        </div>
                    </div>
                    <hr className="separation-line" />
                    <h5 className="subheading">Qualifications</h5>
                    <div className="row-qualification">
                        <div className="column">
                            <label htmlFor="tenthpc">10th Percentage</label>
                            <input type="number" id="tenthpc" name="tenthpc" required />
                        </div>
                        <div className="column">
                            <label htmlFor="twelfthpc">12th Percentage</label>
                            <input type="twelfthpc" id="twelfthpc" name="twelfthpc" />
                        </div>
                        <div className="column">
                            <label htmlFor="deplomapc">Diploma Percentage</label>
                            <input type="deplomapc" id="deplomapc" name="deplomapc" />
                        </div>
                    </div>
                    <h5 className="subheading">Graduation Details</h5>
                    <div className="row">
                        <div className="column">
                            <label htmlFor="degree">Degree</label>
                            <input type="text" id="degree" name="degree" required />
                        </div>
                        <div className="column">
                            <label htmlFor="ginstitute">Institution</label>
                            <input type="text" id="ginstitute" name="ginstitute" required />
                        </div>
                        <div className="column">
                            <label htmlFor="yrgrad">Year of Graduation</label>
                            <input type="text" id="yrgrad" name="yrgrad" required />
                        </div>
                        <div className="column">
                            <label htmlFor="gradpc">Percentage</label>
                            <input type="number" id="gradpc" name="gradpc" required />
                        </div>
                    </div>
                    <div className="row">
                        <div className="column">
                            <label htmlFor="gradresult">Upload Graduation Result</label>
                            <input type="file" name="gradresult" id="gradresult" required />
                        </div>
                    </div>
                    <h5 className="subheading">Post Graduation Details</h5>
                    <div className="row">
                        <div className="column">
                            <label htmlFor="pdegree">Degree</label>
                            <input type="text" id="pdegree" name="pdegree" />
                        </div>
                        <div className="column">
                            <label htmlFor="pinstitute">Institution</label>
                            <input type="text" id="pinstitute" name="pinstitute" />
                        </div>
                        <div className="column">
                            <label htmlFor="yrpgrad">Year of Post Graduation</label>
                            <input type="text" id="yrpgrad" name="yrpgrad" />
                        </div>
                        <div className="column">
                            <label htmlFor="pgradpc">Percentage</label>
                            <input type="number" id="pgradpc" name="pgradpc" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="column">
                            <label htmlFor="pgradresult">Upload Post Graduation Result</label>
                            <input type="file" name="pgradresult" id="pgradresult" />
                        </div>
                    </div>
                    <hr className="separation-line" />
                    <div className="row">
                        <div className="column">
                            <label htmlFor="expertise">Expertise in (comma separated)</label>
                            <input type="text" id="expertise" name="expertise" required />
                        </div>
                        <div className="column">
                            <label htmlFor="teachexp">Teaching Experiece</label>
                            <input type="number" id="teachexp" name="teachexp" required />
                        </div>
                    </div>
                    <div className="row-links">
                    <div className="column">
                            <label htmlFor="linkedin">LinkedIn URL</label>
                            <input type="url" id="linkedin" name="linkedin" />
                        </div>
                        <div className="column">
                            <label htmlFor="portfolio">Portfolio URL</label>
                            <input type="portfolio" id="portfolio" name="portfolio" />
                        </div>
                        <div className="column">
                            <label htmlFor="resume">Upload Resume</label>
                            <input type="file" name="resume" id="resume" required />
                        </div>
                    </div>
                    
                    <hr className="separation-line" />
                    <div className="row-check">
                        <input type="checkbox" name="terms" id="terms" required/>
                        <p>I certify that the information I have provided is accurate and complete. I understand that any false or misleading details may lead to the rejection of my application or future disqualification.</p>
                    </div>

                    <div className="row">
                        <button type="submit">Generate Account</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JoinAsInstructor;