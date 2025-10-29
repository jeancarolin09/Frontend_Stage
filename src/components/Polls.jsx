import React, { useState, useEffect } from "react";
import axios from "axios";

const Polls = ({ event, setEvent }) => {
  const [newPoll, setNewPoll] = useState({ question: "", options: [""] });
  const [editingPollId, setEditingPollId] = useState(null);
  const [editedPoll, setEditedPoll] = useState({ question: "", options: [] });
  const [addingPoll, setAddingPoll] = useState(false);
  const [pollError, setPollError] = useState("");

  // Charger les sondages existants
  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const token = localStorage.getItem("jwt");
        const response = await axios.get(
          `http://localhost:8000/api/events/${event.id}/polls`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEvent((prev) => ({ ...prev, polls: response.data }));
      } catch (err) {
        console.error("Erreur lors du chargement des sondages", err);
      }
    };

    if (event.id) fetchPolls();
  }, [event.id, setEvent]);

  /** --- AJOUT DE SONDAGE --- **/
  const handleAddPoll = async () => {
    if (!newPoll.question || newPoll.options.some((opt) => !opt.trim())) {
      setPollError("Veuillez remplir la question et toutes les options.");
      return;
    }

    setAddingPoll(true);
    setPollError("");

    try {
      const token = localStorage.getItem("jwt");
      const response = await axios.post(
        `http://localhost:8000/api/events/${event.id}/polls`,
        newPoll,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setEvent((prev) => ({
        ...prev,
        polls: [...(prev.polls || []), response.data],
      }));

      setNewPoll({ question: "", options: [""] });
    } catch (err) {
      setPollError(
        err.response?.data?.message || "Erreur lors de la création du sondage"
      );
    } finally {
      setAddingPoll(false);
    }
  };

  /** --- AJOUT / SUPPRESSION D’OPTION DANS UN NOUVEAU SONDAGE --- **/
  const handleAddOption = () => {
    setNewPoll((prev) => ({ ...prev, options: [...prev.options, ""] }));
  };

  const handleRemoveOption = (index) => {
    setNewPoll((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleChangeOption = (index, value) => {
    const updated = [...newPoll.options];
    updated[index] = value;
    setNewPoll({ ...newPoll, options: updated });
  };

  /** --- SUPPRESSION D’UN SONDAGE --- **/
  const handleDeletePoll = async (pollId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce sondage ?")) return;
    try {
      const token = localStorage.getItem("jwt");
      await axios.delete(`http://localhost:8000/api/polls/${pollId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEvent((prev) => ({
        ...prev,
        polls: prev.polls.filter((p) => p.id !== pollId),
      }));
    } catch (err) {
      console.error("Erreur lors de la suppression", err);
    }
  };

  /** --- MODIFICATION D’UN SONDAGE --- **/
  const handleEditPoll = (poll) => {
    setEditingPollId(poll.id);
    setEditedPoll({
      question: poll.question,
      options: poll.options.map((o) => o.text),
    });
  };

  const handleAddEditOption = () => {
    setEditedPoll((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  };

  const handleRemoveEditOption = (index) => {
    setEditedPoll((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleUpdatePoll = async (pollId) => {
    try {
      const token = localStorage.getItem("jwt");
      const response = await axios.put(
        `http://localhost:8000/api/polls/${pollId}`,
        editedPoll,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setEvent((prev) => ({
        ...prev,
        polls: prev.polls.map((p) => (p.id === pollId ? response.data : p)),
      }));
      setEditingPollId(null);
    } catch (err) {
      console.error("Erreur lors de la mise à jour", err);
    }
  };

  return (
    <div>
      <h3 className="font-bold mb-3 text-xl">Créer un sondage</h3>
      <input
        type="text"
        placeholder="Question du sondage"
        value={newPoll.question}
        onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
        className="border px-3 py-2 rounded w-full mb-2"
      />

      {newPoll.options.map((opt, index) => (
        <div key={`newOpt-${index}`} className="flex items-center gap-2 mb-2">
          <input
            type="text"
            placeholder={`Option ${index + 1}`}
            value={opt}
            onChange={(e) => handleChangeOption(index, e.target.value)}
            className="border px-3 py-2 rounded w-full"
          />
          {newPoll.options.length > 1 && (
            <button
              onClick={() => handleRemoveOption(index)}
              className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              ✕
            </button>
          )}
        </div>
      ))}

      <div className="flex space-x-2 mb-3">
        <button
          onClick={handleAddOption}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          + Ajouter une option
        </button>
        <button
          onClick={handleAddPoll}
          disabled={addingPoll}
          className={`px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 ${
            addingPoll ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {addingPoll ? "Création..." : "Créer le sondage"}
        </button>
      </div>
      {pollError && <p className="text-red-500 mt-1">{pollError}</p>}

      <hr className="my-4" />
      <h3 className="font-bold mb-2 text-lg">Sondages existants</h3>

      {event.polls && event.polls.length > 0 ? (
        event.polls.map((poll) => (
          <div
            key={`poll-${poll.id}`}
            className="border rounded-lg p-4 mb-3 shadow-sm bg-gray-50"
          >
            {editingPollId === poll.id ? (
              <>
                <input
                  type="text"
                  value={editedPoll.question}
                  onChange={(e) =>
                    setEditedPoll({ ...editedPoll, question: e.target.value })
                  }
                  className="border px-3 py-2 rounded w-full mb-2"
                />

                {editedPoll.options.map((opt, i) => (
                  <div
                    key={`editOpt-${poll.id}-${i}`}
                    className="flex items-center gap-2 mb-2"
                  >
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const updated = [...editedPoll.options];
                        updated[i] = e.target.value;
                        setEditedPoll({ ...editedPoll, options: updated });
                      }}
                      className="border px-3 py-2 rounded w-full"
                    />
                    {editedPoll.options.length > 1 && (
                      <button
                        onClick={() => handleRemoveEditOption(i)}
                        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                <div className="flex gap-2 mb-3">
                  <button
                    onClick={handleAddEditOption}
                    className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    + Ajouter une option
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdatePoll(poll.id)}
                    className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Enregistrer
                  </button>
                  <button
                    onClick={() => setEditingPollId(null)}
                    className="px-3 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                  >
                    Annuler
                  </button>
                </div>
              </>
            ) : (
              <>
                <h4 className="font-semibold text-lg">{poll.question}</h4>
                <ul className="mt-2">
                  {poll.options && poll.options.length > 0 ? (
                    poll.options.map((opt, j) => (
                      <li
                        key={`poll-${poll.id}-opt-${j}`}
                        className="flex justify-between border-b py-1"
                      >
                        <span>{opt.text}</span>
                        <span className="text-sm text-gray-600">
                          {opt.votes} votes
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 italic">
                      Aucune option disponible.
                    </li>
                  )}
                </ul>

                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => handleEditPoll(poll)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeletePoll(poll.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Supprimer
                  </button>
                </div>
              </>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-600 italic">Aucun sondage pour cet événement.</p>
      )}
    </div>
  );
};

export default Polls;
