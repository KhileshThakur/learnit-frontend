import React, { useState } from "react";
import "./CreateCapsule.css";

const CreateCapsule = ({ instructorId }) => {
  const backenduri = process.env.REACT_APP_BACKEND;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    schedule: [""],
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleScheduleChange = (index, value) => {
    const updatedSchedule = [...formData.schedule];
    updatedSchedule[index] = value;
    setFormData((prev) => ({ ...prev, schedule: updatedSchedule }));
  };

  const addScheduleField = () => {
    setFormData((prev) => ({ ...prev, schedule: [...prev.schedule, ""] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      instructorId,
    };

    try {
      const res = await fetch(`${backenduri}/instructor/capsule/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log(data);

      if (res.ok) {
        setMessage("Capsule created successfully!");
        setFormData({
          name: "",
          description: "",
          startDate: "",
          endDate: "",
          schedule: [""],
        });
      } else {
        setMessage(data.message || "Failed to create capsule.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Server error.");
    }
  };

  return (
    <div className="create-capsule-container">
      <h2 className="create-capsule-title">Create New Capsule</h2>
      {message && <p className="create-capsule-message">{message}</p>}

      <form onSubmit={handleSubmit} className="create-capsule-form">
        <input
          type="text"
          name="name"
          placeholder="Capsule Name"
          value={formData.name}
          onChange={handleChange}
          className="form-input"
          required
        />

        <textarea
          name="description"
          placeholder="Capsule Description"
          value={formData.description}
          onChange={handleChange}
          className="form-textarea"
          rows="4"
        />

        <div className="form-date-group">
          <input
            type="date"           
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="form-input half-width"
            required
          />
          <input
            type="date"          
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="form-input half-width"
            required
          />
        </div>

        <div className="form-schedule-section">
          <label className="form-label">Schedule</label>
          {formData.schedule.map((slot, index) => (
            <input
              key={index}
              type="text"
              value={slot}
              onChange={(e) => handleScheduleChange(index, e.target.value)}
              className="form-input"
              placeholder="e.g. Monday 10am-12pm"
              required
            />
          ))}
          <button
            type="button"
            onClick={addScheduleField}
            className="add-schedule-btn"
          >
            + Add More Schedule
          </button>
        </div>

        <button type="submit" className="submit-btn">
          Create Capsule
        </button>
      </form>
    </div>
  );
};

export default CreateCapsule;
