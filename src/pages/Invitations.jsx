import React, { useState } from "react";
import { useInvitations } from "../hooks/useInvitations";

const Invitations = ({ userEmail }) => {
  const { invitations, loading, error, setInvitations } = useInvitations(userEmail);
  const [confirming, setConfirming] = useState({});
  const [voting, setVoting] = useState({});

  // ✅ Fonction de confirmation d’invitation
  const handleConfirm = async (token, invId) => {
    if (!token) {
      alert("Token manquant !");
      return;
    }
    try {
      setConfirming((prev) => ({ ...prev, [invId]: true }));
      const jwt = localStorage.getItem("jwt");
      await fetch(`http://localhost:8000/api/invitations/${token}/confirm`, {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setInvitations((prev) =>
        prev.map((inv) =>
          inv.id === invId ? { ...inv, confirmed: true, used: true } : inv
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setConfirming((prev) => ({ ...prev, [invId]: false }));
    }
  };

  // ✅ Fonction pour voter à un sondage
  const handleVote = async (eventId, optionId) => {
    try {
      setVoting((prev) => ({ ...prev, [optionId]: true }));
      const jwt = localStorage.getItem("jwt");
      await fetch(`http://localhost:8000/api/events/${eventId}/polls/vote/${optionId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}` },
      });
      alert("✅ Votre vote a été enregistré !");
    } catch (err) {
      console.error("Erreur lors du vote :", err);
      alert("❌ Une erreur est survenue lors du vote.");
    } finally {
      setVoting((prev) => ({ ...prev, [optionId]: false }));
    }
  };

  // ✅ États de chargement
  if (!userEmail) return <p>Chargement du profil utilisateur...</p>;
  if (loading) return <p>Chargement des invitations...</p>;
  if (error) return <p className="text-red-500">{error.message || "Erreur"}</p>;
  if (!invitations || invitations.length === 0) return <p>Aucune invitation pour le moment.</p>;

  return (
    <div className="flex flex-col gap-6">
      {invitations.map((inv) => {
        const event = inv.event;
        const eventDate = event.event_date?.date
          ? new Date(event.event_date.date).toLocaleDateString("fr-FR")
          : "Non précisé";
        const eventTime = event.event_time?.date
          ? new Date(event.event_time.date).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Non précisé";

        return (
          <div key={inv.id} className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-lg font-bold mb-2">{event.title}</h3>
            <p className="text-gray-600 mb-2">
              📅 {eventDate} • 🕐 {eventTime}
            </p>
            <p className="text-gray-500 mb-4">
              📍 {event.event_location || "À déterminer"}
            </p>

            {/* ✅ Bouton de confirmation */}
            {!inv.confirmed ? (
              <button
                onClick={() => handleConfirm(inv.token, inv.id)}
                disabled={confirming[inv.id]}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {confirming[inv.id] ? "Confirmation..." : "Confirmer l'invitation"}
              </button>
            ) : (
              <>
                <p className="text-sm text-green-600 font-semibold mb-4">
                  Invitation confirmée ✅
                </p>

                {/* ✅ Sondages disponibles */}
                {event.polls && event.polls.length > 0 ? (
                  <div className="border-t pt-4">
                    <h4 className="text-md font-semibold mb-2">📊 Sondage</h4>
                    {event.polls.map((poll) => (
                      <div key={poll.id} className="mb-4">
                        <p className="font-medium mb-2">{poll.question}</p>
                        <div className="flex flex-col gap-2">
                          {poll.options.map((opt) => (
                            <button
                              key={opt.text}
                              onClick={() => handleVote(event.id, opt.id)}
                              disabled={voting[opt.id]}
                              className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                            >
                              {opt.text} ({opt.votes} votes)
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Aucun sondage disponible pour cet événement.</p>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Invitations;
