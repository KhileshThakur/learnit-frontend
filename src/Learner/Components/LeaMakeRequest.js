import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import InstructorProfileModal from './InstructorProfileModal';
import './InstructorProfileModal.css';

const LeaMakeRequest = () => {
    const backendurl = process.env.REACT_APP_BACKEND;
    const { id: learnerId } = useParams();

    const [instructors, setInstructors] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [selectedInstructor, setSelectedInstructor] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [requestSubject, setRequestSubject] = useState('');
    const [requestObjective, setRequestObjective] = useState('');
    const [showRequestModal, setShowRequestModal] = useState(false);

    useEffect(() => {
        const fetchInstructors = async () => {
            try {
                const response = await axios.get(`${backendurl}/instructor/all`);
                setInstructors(response.data);
            } catch (error) {
                setErrorMsg('Failed to load instructors.');
            } finally {
                setLoading(false);
            }
        };
        fetchInstructors();
    }, [backendurl]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
    };

    const filteredInstructors = instructors.filter((inst) => {
        const nameMatch = inst.name?.toLowerCase().includes(search.toLowerCase());
        const expertiseMatch = inst.expertise?.join(', ').toLowerCase().includes(search.toLowerCase());
        return nameMatch || expertiseMatch;
    });

    const handleRequest = async (instructor) => {
        setErrorMsg('');
        setSuccessMsg('');
        try {
            const now = new Date();
            await axios.post(`${backendurl}/meeting/request`, {
                learner_id: learnerId,
                instructor_id: instructor._id,
                subject: instructor.expertise?.[0] || 'General',
                topic: 'Meeting Request',
                time: now,
                status: 'pending',
            });
            setSuccessMsg('✅ Meeting request sent successfully!');
            setIsModalOpen(false);
            setSelectedInstructor(null);
            setTimeout(() => setSuccessMsg(''), 2500);
        } catch (error) {
            setErrorMsg('Failed to send meeting request.');
            setTimeout(() => setErrorMsg(''), 2500);
        }
    };

    const handleInstructorClick = (instructor) => {
        setSelectedInstructor(instructor);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedInstructor(null);
    };

    const handleRequestSubmit = async () => {
        try {
            await axios.post(`${backendurl}/meeting/request`, {
                learner_id: learnerId,
                instructor_id: selectedInstructor._id,
                subject: requestSubject,
                topic: requestSubject,
                time: new Date(),
                objective: requestObjective
            });
            setShowRequestModal(false);
            setRequestSubject('');
            setRequestObjective('');
            setSuccessMsg('✅ Meeting request sent successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (error) {
            setErrorMsg('Failed to send meeting request.');
            setTimeout(() => setErrorMsg(''), 3000);
            console.error('Error sending request:', error);
        }
    };

    const handleOpenRequestModal = (instructor) => {
        setIsModalOpen(false);
        setSelectedInstructor(instructor);
        setShowRequestModal(true);
    };

    return (
        <div className="make-request-container">
            <h2 className="make-request-title">Make Request</h2>
            <div className="make-request-search-bar">
                <input
                    type="text"
                    placeholder="search by Instructor name or Subject name"
                    value={search}
                    onChange={handleSearch}
                />
            </div>
            {successMsg && <div className="make-request-success">{successMsg}</div>}
            {errorMsg && <div className="make-request-error">{errorMsg}</div>}
            <div className="instructor-list-scroll-wrapper">
                <div className="instructor-list">
                    {loading ? (
                        <div className="loading">Loading instructors...</div>
                    ) : filteredInstructors.length === 0 ? (
                        <div className="no-instructors">No instructors found.</div>
                    ) : (
                        filteredInstructors.map((instructor) => (
                            <div 
                                className="instructor-card" 
                                key={instructor._id}
                                onClick={() => handleInstructorClick(instructor)}
                            >
                                <div className="instructor-avatar">
                                    <img
                                        src={instructor.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.name || 'I')}&background=4a4a4a&color=fff&size=64`}
                                        alt={instructor.name}
                                    />
                                </div>
                                <div className="instructor-info">
                                    <div className="instructor-name">{instructor.name}</div>
                                    <div className="instructor-meta">
                                        <span className="instructor-expertise">
                                            {instructor.expertise?.join(', ') || 'N/A'}
                                        </span>
                                        {instructor.email && (
                                            <span className="instructor-email">{instructor.email}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="instructor-action">
                                    <button 
                                        className="request-btn" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedInstructor(instructor);
                                            setShowRequestModal(true);
                                        }}
                                    >
                                        Request
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            {isModalOpen && selectedInstructor && (
                <InstructorProfileModal
                    instructor={selectedInstructor}
                    visible={isModalOpen}
                    onClose={handleCloseModal}
                    onRequest={() => handleRequest(selectedInstructor)}
                    onOpenRequestModal={handleOpenRequestModal}
                />
            )}

            {showRequestModal && (
                <div className="lea-request-modal">
                    <div className="lea-request-modal-content" style={{padding: 28, minWidth: 340, maxWidth: 420, borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.18)'}}>
                        <h2 style={{margin: 0, marginBottom: 18, fontWeight: 700, fontSize: '1.3rem', color: '#23232b', textAlign: 'center'}}>Request a Meeting</h2>
                        <div style={{marginBottom: 16}}>
                            <label htmlFor="subject" style={{fontWeight: 600, display: 'block', marginBottom: 6}}>Subject</label>
                            <input
                                id="subject"
                                type="text"
                                value={requestSubject}
                                onChange={e => setRequestSubject(e.target.value)}
                                placeholder="Enter subject (e.g. Math, Science)"
                                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #bbb', fontSize: '1rem' }}
                            />
                        </div>
                        <div style={{marginBottom: 18}}>
                            <label htmlFor="objective" style={{fontWeight: 600, display: 'block', marginBottom: 6}}>Objective</label>
                            <textarea
                                id="objective"
                                value={requestObjective}
                                onChange={e => setRequestObjective(e.target.value)}
                                placeholder="Briefly describe the objective of your meeting..."
                                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #bbb', minHeight: 90, fontSize: '1rem', resize: 'vertical' }}
                            />
                        </div>
                        <div style={{borderTop: '1px solid #eee', margin: '18px 0'}}></div>
                        <div style={{display: 'flex', justifyContent: 'flex-end', gap: 12}}>
                            <button onClick={handleRequestSubmit} style={{background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 22px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer'}}>Submit</button>
                            <button onClick={() => setShowRequestModal(false)} style={{background: '#eee', color: '#23232b', border: 'none', borderRadius: 6, padding: '10px 22px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer'}}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Inline minimal styles for layout, expect full CSS in .css file */}
            <style>{`
                .make-request-container {
                    max-width: 1200px;
                    height: 90vh;
                    margin: 40px auto;
                    background: #23232b;
                    border-radius: 28px;
                    padding: 48px 48px 36px 48px;
                    box-shadow: 0 2px 32px rgba(0,0,0,0.18);
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                }
                .make-request-title {
                    color: #fff;
                    font-size: 2.2rem;
                    margin-bottom: 28px;
                }
                .make-request-search-bar {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 32px;
                }
                .make-request-search-bar input {
                    width: 420px;
                    padding: 14px 22px;
                    border-radius: 28px;
                    border: none;
                    font-size: 1.1rem;
                    background: #181820;
                    color: #fff;
                }
                .instructor-list-scroll-wrapper {
                    flex: 1 1 auto;
                    max-height: unset;
                    height: 100%;
                    overflow-y: auto;
                    margin-bottom: 8px;
                    padding-right: 12px;
                }
                .instructor-list {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 16px;
                }
                .instructor-card {
                    display: flex;
                    align-items: center;
                    background: #292938;
                    border-radius: 12px;
                    padding: 16px;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.1);
                    cursor: pointer;
                    transition: all 0.2s ease-in-out;
                }
                .instructor-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                    background: #2e2e3d;
                }
                .instructor-avatar img {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    object-fit: cover;
                    background: #4a4a4a;
                }
                .instructor-info {
                    flex: 1;
                    margin-left: 16px;
                    min-width: 0;
                }
                .instructor-name {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #fff;
                    margin-bottom: 4px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .instructor-meta {
                    font-size: 0.9rem;
                    color: #bdbdbd;
                }
                .instructor-expertise {
                    font-weight: 500;
                    display: block;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .instructor-email {
                    display: block;
                    font-size: 0.85rem;
                    color: #a0a0a0;
                    margin-top: 2px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .instructor-action {
                    margin-left: 12px;
                }
                .request-btn {
                    background: #4caf50;
                    color: #fff;
                    border: none;
                    border-radius: 8px;
                    padding: 8px 16px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                    white-space: nowrap;
                }
                .request-btn:hover {
                    background: #388e3c;
                }
                .make-request-success {
                    background: #2e7d32;
                    color: #fff;
                    padding: 14px 24px;
                    border-radius: 10px;
                    margin-bottom: 24px;
                    text-align: center;
                    font-weight: 600;
                    font-size: 1.1rem;
                }
                .make-request-error {
                    background: #c62828;
                    color: #fff;
                    padding: 14px 24px;
                    border-radius: 10px;
                    margin-bottom: 24px;
                    text-align: center;
                    font-weight: 600;
                    font-size: 1.1rem;
                }
                @media (max-width: 900px) {
                    .make-request-container {
                        max-width: 98vw;
                        padding: 16px 4vw;
                        margin: 20px auto;
                    }
                    .instructor-list {
                        grid-template-columns: 1fr;
                    }
                    .instructor-card {
                        flex-direction: row;
                        align-items: center;
                        padding: 12px;
                    }
                    .instructor-info {
                        margin-left: 12px;
                        margin-top: 0;
                    }
                    .instructor-action {
                        margin-left: 12px;
                        margin-top: 0;
                        width: auto;
                    }
                    .request-btn {
                        width: auto;
                    }
                }
                @media (max-width: 600px) {
                    .make-request-title {
                        font-size: 1.3rem;
                    }
                    .make-request-search-bar input {
                        width: 98vw;
                        font-size: 1rem;
                    }
                    .instructor-list-scroll-wrapper {
                        max-height: 220px;
                    }
                }
            `}</style>
        </div>
    );
};

export default LeaMakeRequest;
