import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const LeaMakeRequest = () => {
    const backendurl = process.env.REACT_APP_BACKEND;
    const { id: learnerId } = useParams(); // Retrieve learner ID from the URL

    const [instructors, setInstructors] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [meetingForm, setMeetingForm] = useState({
        subject: '',
        topic: '',
        time: '',
        instructor_id: ''
    });
    const [loading, setLoading] = useState(true); // Loading state for instructors
    const [formError, setFormError] = useState(''); // Error state for form validation

    // Fetch instructors on component mount
    useEffect(() => {
        const fetchInstructors = async () => {
            try {
                const response = await axios.get(`${backendurl}/instructor/all`);
                setInstructors(response.data);
            } catch (error) {
                console.error('Error fetching instructors:', error);
            } finally {
                setLoading(false); // Stop loading once data is fetched
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
        setFormError(''); // Clear any existing form errors
    };

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setMeetingForm({ ...meetingForm, [name]: value });
    };

    // Submit meeting request
    const submitMeetingRequest = async () => {
        // Validate form fields
        if (!meetingForm.subject || !meetingForm.topic || !meetingForm.time || !meetingForm.instructor_id) {
            setFormError('Please fill in all fields.');
            return;
        }

        try {
            await axios.post(`${backendurl}/meeting/request`, { // Updated endpoint without learner ID in URL
                ...meetingForm,
                learner_id: learnerId, // Add learner ID to the request body
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
        <div>
            <h2>Instructors</h2>
            {loading ? (
                <p>Loading instructors...</p>
            ) : (
                instructors.length > 0 ? (
                    <ul>
                        {instructors.map((instructor) => (
                            <li key={instructor._id}>
                                {instructor.name} - {instructor.expertise.join(', ')}
                                <button onClick={() => openPopup(instructor._id)}>Request Meeting</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No instructors available at the moment.</p>
                )
            )}

            {/* Meeting Request Popup */}
            {isPopupOpen && (
                <div className="popup" role="dialog" aria-modal="true">
                    <div className="popup-content">
                        <h3>Request Meeting</h3>
                        {formError && <p style={{ color: 'red' }}>{formError}</p>}
                        <label>
                            Subject:
                            <input type="text" name="subject" value={meetingForm.subject} onChange={handleInputChange} />
                        </label>
                        <label>
                            Topic:
                            <input type="text" name="topic" value={meetingForm.topic} onChange={handleInputChange} />
                        </label>
                        <label>
                            Time:
                            <input type="datetime-local" name="time" value={meetingForm.time} onChange={handleInputChange} />
                        </label>
                        <button onClick={submitMeetingRequest}>Submit</button>
                        <button onClick={closePopup}>Cancel</button>
                    </div>
                </div>
            )}
            <style jsx>{`
                .popup {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .popup-content {
                    background: #77777;
                    padding: 20px;
                    border-radius: 8px;
                    width: 300px;
                }
                label {
                    display: block;
                    margin-bottom: 10px;
                }
                input {
                    width: 100%;
                    padding: 8px;
                    margin-top: 4px;
                }
            `}</style>
        </div>
    );
};

export default LeaMakeRequest;
