import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './LeaMakeRequest.css';

const LeaMakeRequest = () => {
    const backendurl = process.env.REACT_APP_BACKEND;
    const { id: learnerId } = useParams();

    const [instructors, setInstructors] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [meetingForm, setMeetingForm] = useState({
        subject: '',
        topic: '',
        time: '',
        instructor_id: ''
    });
    const [loading, setLoading] = useState(true);
    const [formError, setFormError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch instructors on component mount
    useEffect(() => {
        const fetchInstructors = async () => {
            try {
                const response = await axios.get(`${backendurl}/instructor/all`);
                setInstructors(response.data);
            } catch (error) {
                console.error('Error fetching instructors:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchInstructors();
    }, [backendurl]);

    // Open the popup and set the selected instructor ID
    const openPopup = (instructorId) => {
        setMeetingForm({ ...meetingForm, instructor_id: instructorId });
        setIsPopupOpen(true);
    };

    // Close the popup
    const closePopup = () => {
        setIsPopupOpen(false);
        setMeetingForm({ subject: '', topic: '', time: '', instructor_id: '' });
        setFormError('');
    };

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setMeetingForm({ ...meetingForm, [name]: value });
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Filter instructors based on search term
    const filteredInstructors = instructors.filter(instructor => 
        instructor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructor.expertise?.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Submit meeting request
    const submitMeetingRequest = async () => {
        if (!meetingForm.subject || !meetingForm.topic || !meetingForm.time || !meetingForm.instructor_id) {
            setFormError('Please fill in all fields.');
            return;
        }

        try {
            await axios.post(`${backendurl}/meeting/request`, {
                ...meetingForm,
                learner_id: learnerId,
                status: "pending"
            });
            alert('Meeting request submitted successfully');
            closePopup();
        } catch (error) {
            console.error('Error submitting meeting request:', error);
            alert('Failed to submit meeting request');
        }
    };

    return (
        <div className="make-request-container">
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search by instructor name or Subject name"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </div>

            {loading ? (
                <div className="loading-spinner">Loading instructors...</div>
            ) : (
                <div className="instructors-scrollable">
                    <div className="instructors-grid">
                        {filteredInstructors.map((instructor) => (
                            <div key={instructor._id} className="instructor-card">
                                <div className="instructor-info">
                                    <div className="instructor-avatar">
                                        <img src={instructor.avatar || 'https://via.placeholder.com/60'} alt={instructor.name} />
                                    </div>
                                    <div className="instructor-details">
                                        <div className="instructor-name">{instructor.name}</div>
                                        <div className="instructor-education">
                                            {instructor.education?.join(', ') || 'B.Tech - Computer'}
                                        </div>
                                        <div className="instructor-schedule">6:00pm - 10:00pm</div>
                                        <div className="instructor-expertise">
                                            <div className="expertise-label">Expertise in :</div>
                                            <div className="expertise-items">
                                                {instructor.expertise?.map((exp, index) => (
                                                    <span key={index} className="expertise-item">
                                                        {exp}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="instructor-meta">
                                    <div className="experience">Experience : {instructor.experience || '20+ years'}</div>
                                    <div className="fees">Fees : ${instructor.fees || '50'} per hr</div>
                                    <button 
                                        className="request-button"
                                        onClick={() => openPopup(instructor._id)}
                                    >
                                        Request
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Meeting Request Popup */}
            {isPopupOpen && (
                <div className="popup" role="dialog" aria-modal="true">
                    <div className="popup-content">
                        <h3>Request Meeting</h3>
                        {formError && <div className="error-message">{formError}</div>}
                        <div className="form-group">
                            <label>Subject:</label>
                            <input 
                                type="text" 
                                name="subject" 
                                value={meetingForm.subject} 
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Topic:</label>
                            <input 
                                type="text" 
                                name="topic" 
                                value={meetingForm.topic} 
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Time:</label>
                            <input 
                                type="datetime-local" 
                                name="time" 
                                value={meetingForm.time} 
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-actions">
                            <button className="cancel-btn" onClick={closePopup}>Cancel</button>
                            <button className="submit-btn" onClick={submitMeetingRequest}>Submit</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaMakeRequest;
