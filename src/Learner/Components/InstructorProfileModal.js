import React from 'react';
import './InstructorProfileModal.css';

const InstructorProfileModal = ({ instructor, onClose, onRequest }) => {
    const formatQualification = (instructor) => {
        const qualifications = [];
        if (instructor?.qualification?.gdegree) {
            qualifications.push(`${instructor.qualification.gdegree}`);
        }
        if (instructor?.qualification?.pdegree) {
            qualifications.push(`${instructor.qualification.pdegree}`);
        }
        return qualifications.join(' | ');
    };

    return (
        <div className="instructor-profile-modal-overlay">
            <div className="instructor-profile-modal">
                <button className="modal-close-btn" onClick={onClose}>×</button>
                
                <div className="modal-header">
                    <div className="instructor-avatar-large">
                        <img
                            src={instructor.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.name || 'I')}&background=4a4a4a&color=fff&size=128`}
                            alt={instructor.name}
                        />
                    </div>
                    <h2>{instructor.name}</h2>
                </div>

                <div className="modal-content">
                    <div className="info-grid">
                        <div className="info-section">
                            <h3>Contact</h3>
                            <p>{instructor.email}</p>
                            {instructor.phone && <p>{instructor.phone}</p>}
                        </div>

                        <div className="info-section">
                            <h3>Experience</h3>
                            <p>{instructor.teachexp} years</p>
                        </div>

                        <div className="info-section">
                            <h3>Expertise</h3>
                            <div className="expertise-tags">
                                {instructor.expertise?.map((exp, index) => (
                                    <span key={index} className="expertise-tag">{exp}</span>
                                ))}
                            </div>
                        </div>

                        <div className="info-section">
                            <h3>Qualifications</h3>
                            <p>{formatQualification(instructor)}</p>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button 
                        className="request-meeting-btn"
                        onClick={() => onRequest(instructor)}
                    >
                        Request One-on-One Meeting
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstructorProfileModal; 