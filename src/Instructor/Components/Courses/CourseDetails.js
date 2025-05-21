import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CourseDetails.css';

const VideoPlayer = ({ video, onClose }) => (
    <div className="video-player-overlay">
        <div className="video-player-content" role="dialog" aria-modal="true" aria-label={`Playing video: ${video.title}`}>
            <button className="close-btn" onClick={onClose} aria-label="Close video player">×</button>
            <h3>{video.title}</h3>
            <video
                controls
                autoPlay
                src={video.videoUrl}
                className="video-player-video"
            />
        </div>
    </div>
);

const EditCoursePopup = ({ course, onClose, onSave }) => {
    const [title, setTitle] = useState(course.title);
    const [description, setDescription] = useState(course.description || '');
    const [category, setCategory] = useState(course.category || '');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/course/edit/${course._id}`, {
                title, description, category
            });
            onSave();
        } catch (err) {
            alert('Failed to update course');
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <h2>Edit Course</h2>
                <form onSubmit={handleSubmit} className="popup-form">
                    <label>Title
                        <input value={title} onChange={e => setTitle(e.target.value)} required />
                    </label>
                    <label>Description
                        <textarea value={description} onChange={e => setDescription(e.target.value)} />
                    </label>
                    <label>Category
                        <input value={category} onChange={e => setCategory(e.target.value)} />
                    </label>
                    <div className="popup-buttons">
                        <button type="submit">Save</button>
                        <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AddVideoPopup = ({ courseId, onClose, onAdd, instructorId }) => {
    const [title, setTitle] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!videoFile) {
            alert('Please select a video file');
            return;
        }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('video', videoFile);
            formData.append('instructorId', instructorId);
            formData.append('courseId', courseId);

            await axios.post(`http://localhost:5000/api/course/${courseId}/upload-video`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            onAdd();
        } catch (err) {
            alert('Failed to upload video');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <h2>Add Video</h2>
                <form onSubmit={handleSubmit} className="popup-form">
                    <label>Video Title
                        <input value={title} onChange={e => setTitle(e.target.value)} required />
                    </label>
                    <label>Video File
                        <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files[0])} required />
                    </label>
                    <div className="popup-buttons">
                        <button type="submit" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</button>
                        <button type="button" onClick={onClose} className="cancel-btn" disabled={uploading}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CourseDetails = ({ course: initialCourse, onBack, refreshCourses, instructorId }) => {
    const [course, setCourse] = useState(initialCourse);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [showAddVideoPopup, setShowAddVideoPopup] = useState(false);
    const [playingVideo, setPlayingVideo] = useState(null);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/course/${initialCourse._id}`);
                setCourse(res.data);
            } catch (err) {
                alert('Failed to fetch updated course');
            }
        };

        fetchCourse();
    }, [showEditPopup, showAddVideoPopup]);

    const handleDeleteCourse = async () => {
        if (window.confirm('Delete this course and all videos?')) {
            await axios.delete(`http://localhost:5000/api/course/delete/${course._id}`);
            onBack();
            refreshCourses();
        }
    };

    const handleDeleteVideo = async (videoId) => {
        if (window.confirm('Delete this video?')) {
            try {
                console.log(course._id, videoId);
                await axios.delete(`http://localhost:5000/api/course/video/delete/${course._id}/${videoId}`);

                // Re-fetch updated course data
                const res = await axios.get(`http://localhost:5000/api/course/${course._id}`);
                setCourse(res.data);

                // Optional: refresh parent list too
                refreshCourses();
            } catch {
                alert('Failed to delete video');
            }
        }
    };


    return (
        <div className="course-details-container">
            <button className="back-btn" onClick={onBack}>← Back</button>

            <div className="course-main">
                <div className="course-info">
                    <h1>{course.title}</h1>
                    <p className="course-description">{course.description || 'No description'}</p>
                    <div className="course-buttons">
                        <button onClick={() => setShowEditPopup(true)}>Edit Course</button>
                        <button onClick={handleDeleteCourse} className="danger-btn">Delete Course</button>
                        <button onClick={() => setShowAddVideoPopup(true)}>Add Video</button>
                    </div>
                </div>

                <div className="video-list">
                    {course.videos.length === 0 ? (
  <p>No videos added yet.</p>
) : (
  course.videos.map((video, idx) => {
    console.log('Video object:', video);
    return (
      <div key={video._id || idx} className="video-item">
        <div className="video-title" onClick={() => setPlayingVideo(video)}>
          {idx + 1}. {video.title}
        </div>
        <button
          className="delete-video-btn"
          onClick={() => handleDeleteVideo(video._id || video.id)}
          title="Delete Video"
        >
          🗑️
        </button>
      </div>
    );
  })
)}

                </div>
            </div>

            {showEditPopup && (
                <EditCoursePopup
                    course={course}
                    onClose={() => setShowEditPopup(false)}
                    onSave={() => {
                        setShowEditPopup(false);
                        refreshCourses();
                    }}
                />
            )}

            {showAddVideoPopup && (
                <AddVideoPopup
                    courseId={course._id}
                    instructorId={instructorId}
                    onClose={() => setShowAddVideoPopup(false)}
                    onAdd={() => {
                        setShowAddVideoPopup(false);
                        refreshCourses();
                    }}
                />
            )}

            {playingVideo && (
                <VideoPlayer
                    video={playingVideo}
                    onClose={() => setPlayingVideo(null)}
                />
            )}
        </div>
    );
};

export default CourseDetails;
