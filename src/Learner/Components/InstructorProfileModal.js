import React, { useState } from 'react';
import { Modal, Button } from 'antd';
import './InstructorProfileModal.css';

const InstructorProfileModal = ({ instructor, visible, onClose, onRequest, onOpenRequestModal }) => {
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
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            centered
            closable
            className="instructor-profile-ant-modal"
            width={420}
        >
                <div className="modal-header">
                    <div className="instructor-avatar-large">
                        <img
                            src={instructor.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.name || 'I')}&background=4a4a4a&color=fff&size=128`}
                            alt={instructor.name}
                        style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                        />
                    </div>
                    <h2>{instructor.name}</h2>
                </div>
                <div className="modal-content">
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
                <div className="modal-footer">
                <Button 
                        className="request-meeting-btn"
                    type="primary"
                    block
                    size="large"
                        onClick={() => { onClose(); onOpenRequestModal(instructor); }}
                    style={{ fontWeight: 800, fontSize: '1.1rem', background: 'linear-gradient(90deg, #A57BFF 0%, #6a4aff 100%)', border: 'none' }}
                    >
                        Request One-on-One Meeting
                </Button>
            </div>
        </Modal>
    );
};

export default InstructorProfileModal; 