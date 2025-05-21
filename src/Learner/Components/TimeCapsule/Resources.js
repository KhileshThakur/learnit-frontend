import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Resources.css";

const Resources = ({ capsuleId }) => {
  const backenduri = process.env.REACT_APP_BACKEND;
  const [resources, setResources] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState(null);
  const [customName, setCustomName] = useState("");
  const [userInfo, setUserInfo] = useState({ id: "", type: "" });

  const fetchResources = async () => {
    try {
      const res = await axios.get(`${backenduri}/capsule-resources/${capsuleId}`);
      setResources(res.data.resources);
    } catch (error) {
      console.error("Failed to fetch resources", error);
    }
  };

  useEffect(() => {
    const pathname = window.location.pathname;
    const parts = pathname.split("/");
    const type = parts[1];
    const id = parts[2];
    setUserInfo({ id, type });

    if (capsuleId) fetchResources();
  }, [capsuleId, backenduri]);

  const handleUpload = async () => {
    if (!file || !customName) {
      alert("Please select a file and enter a custom name.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("customFileName", customName);
    formData.append("uploaderId", userInfo.id);
    formData.append("uploaderType", userInfo.type);

    try {
      await axios.post(`${backenduri}/capsule-resources/upload/${capsuleId}`, formData);
      setShowModal(false);
      setFile(null);
      setCustomName("");
      fetchResources();
    } catch (error) {
      console.error("Failed to upload resource", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${backenduri}/capsule-resources/${id}`);
      fetchResources();
    } catch (error) {
      console.error("Failed to delete resource", error);
    }
  };

  return (
    <div className="resources-container">
      <div className="resources-header">
        <h2 className="resources-title">Resources</h2>
        <button className="add-resource-button" onClick={() => setShowModal(true)}>
          + Add Resource
        </button>
      </div>

      <div className="resources-grid">
        {resources.map((resource) => (
          <div key={resource._id} className="resource-card">
            <div className="resource-name">📄 {resource.fileName}</div>
            <div className="resource-actions">
              <a
                href={resource.fileUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="download-button"
              >
                Download
              </a>
              <button
                onClick={() => handleDelete(resource._id)}
                className="delete-button"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">📤 Upload Resource</h3>
            <input
              type="text"
              placeholder="Enter custom name..."
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="input-field"
            />
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="input-field"
            />
            <div className="modal-buttons">
              <button className="cancel-button" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="upload-button" onClick={handleUpload}>
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;
