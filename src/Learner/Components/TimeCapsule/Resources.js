import React, { useState, useEffect } from "react";
import axios from "axios";

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
    const type = parts[1]; // learner or instructor
    const id = parts[2];   // user id
    setUserInfo({ id, type });

    if (capsuleId) fetchResources();
  }, [capsuleId,backenduri]);

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
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Resources</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Resource
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {resources.map((resource) => (
          <div
            key={resource._id}
            className="border rounded-lg p-3 bg-white shadow flex flex-col justify-between"
          >
            <div className="font-semibold text-gray-800 mb-2">{resource.fileName}</div>

            <div className="flex gap-2 mt-auto">
              <a
                href={resource.fileUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-green-500 text-white px-2 py-1 rounded text-center text-sm hover:bg-green-600"
              >
                Download
              </a>
              <button
                onClick={() => handleDelete(resource._id)}
                className="flex-1 bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 space-y-4">
            <h3 className="text-lg font-bold mb-2">Upload Resource</h3>
            <input
              type="text"
              placeholder="Custom Resource Name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="border p-2 w-full rounded"
            />
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="border p-2 w-full rounded"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
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
