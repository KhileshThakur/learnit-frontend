import React, { useState } from "react";

const CreateCapsule = ({instructorId}) => {

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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleScheduleChange = (index, value) => {
    const updatedSchedule = [...formData.schedule];
    updatedSchedule[index] = value;
    setFormData(prev => ({ ...prev, schedule: updatedSchedule }));
  };

  const addScheduleField = () => {
    setFormData(prev => ({ ...prev, schedule: [...prev.schedule, ""] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      instructorId
    };

    try {
      const res = await fetch(`${backenduri}/instructor/capsule/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
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
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create New Capsule</h2>
      {message && <p className="mb-4 text-blue-600">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Capsule Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <textarea
          name="description"
          placeholder="Capsule Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          rows="4"
        />

        <div className="flex gap-4">
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="w-1/2 border p-2 rounded"
            required
          />
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="w-1/2 border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Schedule</label>
          {formData.schedule.map((slot, index) => (
            <input
              key={index}
              type="text"
              value={slot}
              onChange={(e) => handleScheduleChange(index, e.target.value)}
              className="w-full mb-2 border p-2 rounded"
              placeholder="e.g. Monday 10am-12pm"
              required
            />
          ))}
          <button
            type="button"
            onClick={addScheduleField}
            className="text-blue-500 mt-2 hover:underline"
          >
            + Add More Schedule
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
        >
          Create Capsule
        </button>
      </form>
    </div>
  );
};

export default CreateCapsule;
