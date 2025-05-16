import React, { useEffect, useState } from "react";
import axios from "axios";

const Participants = ({ capsuleId }) => {
  const [instructor, setInstructor] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/instructor/capsule/${capsuleId}/participants`
        );

        if (res.data.success) {
          setInstructor(res.data.instructor);

          const uniqueParticipants = Array.from(
            new Map(res.data.participants.map(p => [p._id, p])).values()
          );

          setParticipants(uniqueParticipants);
        }
      } catch (error) {
        console.error("Error fetching participants:", error);
      } finally {
        setLoading(false);
      }
    };

    if (capsuleId) fetchParticipants();
  }, [capsuleId]);

  const openPopup = (data) => setSelected(data);
  const closePopup = () => setSelected(null);

  if (loading) return <p>Loading participants...</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Capsule Participants</h2>

      {/* Instructor */}
      {instructor && (
        <div
          className="bg-blue-100 hover:bg-blue-200 cursor-pointer p-2 rounded mb-3"
          onClick={() => openPopup({ ...instructor, role: "Instructor" })}
        >
          👨‍🏫 <strong>{instructor.name}</strong> — Instructor
        </div>
      )}

      {/* Participants */}
      {participants.map((p) => (
        <div
          key={p._id}
          className="bg-gray-100 hover:bg-gray-200 cursor-pointer p-2 rounded mb-2"
          onClick={() => openPopup({ ...p, role: "Participant" })}
        >
          👤 {p.name}
        </div>
      ))}

      {/* Popup Modal */}
      {selected && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-3 text-xl text-gray-500 hover:text-red-600"
              onClick={closePopup}
            >
              &times;
            </button>

            <h3 className="text-xl font-semibold mb-2">
              {selected.role}: {selected.name}
            </h3>
            <div className="space-y-1">
              {selected.email && <p><strong>Email:</strong> {selected.email}</p>}
              {selected.phone && <p><strong>Phone:</strong> {selected.phone}</p>}
              {selected.expertise && <p><strong>Expertise:</strong> {selected.expertise.join(", ")}</p>}
              {selected.teachexp && <p><strong>Teaching Exp:</strong> {selected.teachexp} yrs</p>}
              {selected.college && <p><strong>College:</strong> {selected.college}</p>}
              {selected.university && <p><strong>University:</strong> {selected.university}</p>}
              {selected.department && <p><strong>Department:</strong> {selected.department}</p>}
              {selected.linkedin && (
                <p>
                  <strong>LinkedIn:</strong>{" "}
                  <a href={selected.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                    {selected.linkedin}
                  </a>
                </p>
              )}
              {selected.portfolio && (
                <p>
                  <strong>Portfolio:</strong>{" "}
                  <a href={selected.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                    {selected.portfolio}
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Participants;
