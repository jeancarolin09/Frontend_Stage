// src/components/Guests.js
import React, { useState } from "react";
import axios from "axios";

const Guests = ({ event, setEvent }) => {
  const [newGuest, setNewGuest] = useState({ name: "", email: "" });
  const [addingGuest, setAddingGuest] = useState(false);
  const [guestError, setGuestError] = useState("");

  const handleAddGuest = async () => {
    if (!newGuest.email) {
      setGuestError("L'email est obligatoire");
      return;
    }

    setAddingGuest(true);
    setGuestError("");

    try {
      const token = localStorage.getItem("jwt");
      const response = await axios.post(
        `http://localhost:8000/api/events/${event.id}/guests`,
        { name: newGuest.name, email: newGuest.email },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      setEvent((prev) => ({
        ...prev,
        guests: [...prev.guests, response.data],
      }));

      setNewGuest({ name: "", email: "" });
    } catch (err) {
      setGuestError(err.response?.data?.message || "Erreur lors de l'ajout de l'invité");
    } finally {
      setAddingGuest(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="font-bold mb-2">Ajouter un invité</h3>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Nom"
            value={newGuest.name}
            onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
            className="border px-3 py-2 rounded w-1/3"
          />
          <input
            type="email"
            placeholder="Email"
            value={newGuest.email}
            onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
            className="border px-3 py-2 rounded w-1/3"
          />
          <button
            onClick={handleAddGuest}
            disabled={addingGuest}
            className={`px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 ${
              addingGuest ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {addingGuest ? "Ajout..." : "Ajouter"}
          </button>
        </div>
        {guestError && <p className="text-red-500 mt-1">{guestError}</p>}
      </div>

      {event.guests.length > 0 ? (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">Nom</th>
              <th className="border px-4 py-2 text-left">Email</th>
              <th className="border px-4 py-2 text-left">Statut</th>
            </tr>
          </thead>
          <tbody>
            {event.guests.map((guest, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{guest.name || "—"}</td>
                <td className="border px-4 py-2">{guest.email}</td>
                <td className="border px-4 py-2">{guest.confirmed ? "Présent" : "En attente"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-600 italic">Aucun invité pour le moment.</p>
      )}
    </div>
  );
};

export default Guests;
