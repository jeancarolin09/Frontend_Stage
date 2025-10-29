import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Guests from "../components/Guests";
import Polls from "../components/Polls";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [activeTab, setActiveTab] = useState("informations");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem("jwt");
        if (!token) throw new Error("Utilisateur non authentifié");

        const response = await axios.get(`http://localhost:8000/api/events/${id}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });

        const data = response.data;
        setEvent({
          ...data,
          guests: data.guests || [],
          polls: data.polls || [],
        });
      } catch (err) {
        setError("Événement introuvable ou erreur réseau");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return <div className="text-center mt-16 text-gray-700">Chargement de l'événement...</div>;
  }

  if (error || !event) {
    return (
      <div className="text-center mt-16">
        <h2 className="text-2xl font-bold text-gray-700">{error || "Événement introuvable 😢"}</h2>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-6 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Retour au Dashboard
        </button>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "informations":
        return (
          <div className="space-y-2 text-gray-700">
            <p><strong>Date :</strong> {event.event_date}</p>
            <p><strong>Heure :</strong> {event.event_time}</p>
            <p><strong>Lieu :</strong> {event.event_location || "Non précisé"}</p>
            <p>
              <strong>Participants confirmés :</strong> {event.guests.filter((g) => g.confirmed).length}
            </p>
          </div>
        );
      case "invites":
        return <Guests event={event} setEvent={setEvent} />;
      case "sondages":
        return <Polls event={event} setEvent={setEvent} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-4 text-purple-600 hover:underline"
      >
        ← Retour au Dashboard
      </button>

      <h2 className="text-3xl font-bold text-gray-800 mb-2">{event.title}</h2>
      <p className="text-gray-600 mb-6">{event.description || "Aucune description fournie."}</p>

      {/* Onglets */}
      <div className="flex space-x-4 mb-6">
        {["informations", "invites", "sondages"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded ${
              activeTab === tab ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            {tab === "invites" ? "Invités" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {renderTabContent()}
    </div>
  );
};

export default EventDetails;
