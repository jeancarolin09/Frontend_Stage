import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEvents } from "../hooks/useEvents";
import { useAuth } from "../context/AuthContext";
import { Menu, X } from "lucide-react";
import Invitations from "./Invitations";

function Dashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { data: eventsData, isLoading, isError } = useEvents();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("events");

  const events = Array.isArray(eventsData) ? eventsData : [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Chargement des événements...</p>
      </div>
    );
  }

  if (isError) {
    navigate("/login");
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed md:static z-50 top-0 left-0 h-full w-64 bg-white border-r border-gray-200 p-4 flex flex-col gap-3 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex justify-between items-center mb-6 md:hidden">
          <h1 className="text-lg font-bold text-purple-700">Menu</h1>
          <button onClick={() => setSidebarOpen(false)}>
            <X size={24} className="text-gray-600 hover:text-purple-600" />
          </button>
        </div>

        <button
          onClick={() => setActiveTab("events")}
          className={`flex items-center justify-between w-full px-3 py-2 rounded-lg font-semibold ${
            activeTab === "events"
              ? "bg-purple-100 text-purple-700"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <span className="flex items-center gap-2">🏠 Accueil</span>
        </button>

        <button
          onClick={() => setActiveTab("invitations")}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold ${
            activeTab === "invitations"
              ? "bg-purple-100 text-purple-700"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          ✉️ Invitations
        </button>

        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-center text-white bg-red-500 hover:bg-red-600 rounded-lg font-medium"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Bouton menu mobile */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="absolute top-4 left-4 md:hidden bg-purple-600 text-white p-2 rounded-md shadow-md z-40"
      >
        <Menu size={22} />
      </button>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto md:ml-0 mt-12 md:mt-0">
        {activeTab === "events" ? (
          <>
            <h2 className="text-2xl font-bold text-gray-800">Mes Événements</h2>
            <p className="text-gray-500 mb-4">
              {events.length} événement{events.length > 1 ? "s" : ""}
            </p>

            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 bg-white rounded-xl shadow-sm text-center">
                <div className="text-5xl mb-3">📅</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun événement</h3>
                <p className="text-gray-500 mb-5">Créez votre premier événement pour commencer.</p>
                <button
                  onClick={() => navigate("/create-event")}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg"
                >
                  + Créer un événement
                </button>
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                {events.map((event) => {
                const eventDate = event.event_date ? new Date(event.event_date).toLocaleDateString("fr-FR"): "Non précisé";
                const eventTime = new Date(event.event_time.date).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div key={event.id} className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col">
                      <div className="w-full h-40 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-5xl text-white">
                        🎉
                      </div>
                      <div className="mt-4 flex-1">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">{event.title}</h3>
                        <div className="text-gray-600 text-sm mb-2">
                          📅 {eventDate} • 🕐 {eventTime}
                        </div>
                        <p className="text-gray-500 mb-4">
                          📍 {event.event_location || "À déterminer"}
                        </p>
                        <button
                          onClick={() => navigate(`/event/${event.id}`)}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition"
                        >
                          Voir les détails
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <Invitations userEmail={user?.email} />
        )}
      </main>
    </div>
  );
}

export default Dashboard;
