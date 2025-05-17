import React, { useEffect, useState } from "react";
import axios from "axios";
import './Participants.css';

const Participants = ({ capsuleId }) => {
  const [instructor, setInstructor] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND}/instructor/capsule/${capsuleId}/participants`
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

  if (loading) return <p className="participants-loading">Loading participants...</p>;

  return (
    <div className="participants-container">

      {/* Instructor */}
      {instructor && (
        <div
          className="participant-card instructor-card"
          onClick={() => openPopup({ ...instructor, role: "Instructor" })}
        >
          👨‍🏫 <strong>{instructor.name}</strong> — Instructor
        </div>
      )}

      {/* Participants */}
      {participants.map((p) => (
        <div
          key={p._id}
          className="participant-card"
          onClick={() => openPopup({ ...p, role: "Participant" })}
        >
          👤 {p.name}
        </div>
      ))}

      {/* Popup Modal */}
      {selected && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-modal" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={closePopup}>&times;</button>
            <h3 className="popup-title">{selected.role}: {selected.name}</h3>
            <div className="popup-details">
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
                  <a href={selected.linkedin} target="_blank" rel="noopener noreferrer">{selected.linkedin}</a>
                </p>
              )}
              {selected.portfolio && (
                <p>
                  <strong>Portfolio:</strong>{" "}
                  <a href={selected.portfolio} target="_blank" rel="noopener noreferrer">{selected.portfolio}</a>
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
