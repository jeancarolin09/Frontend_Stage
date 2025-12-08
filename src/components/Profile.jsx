import React, { useEffect, useState } from "react";
import { Calendar, Bookmark, Heart, ArrowLeft, Edit, Mail, Clock, TrendingUp, MapPin } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user } = useAuth();
  const [userEvents, setUserEvents] = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const Avatar = ({ user, size = "28", showOnlineStatus = true }) => {
    const isOnline = user?.isOnline === true;
    const dimensionClass = `w-${size} h-${size}`;

    return (
      <div className={`relative ${dimensionClass}`}>
        {user?.profilePicture ? (
          <img
            src={`http://localhost:8000${user.profilePicture}`}
            alt={user?.name}
            className={`rounded-full object-cover border-2 border-white shadow-md ${dimensionClass}`}
          />
        ) : (
          <div
            className={`rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold flex items-center justify-center border-2 border-white shadow-md ${dimensionClass}`}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
          </div>
        )}

        {/* {showOnlineStatus && isOnline && ( */}
          {/* <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full z-10"></span> */}
        {/* )} */}
      </div>
    );
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("jwt");

        const resUserEvents = await axios.get(
          `http://localhost:8000/api/events?author=${user.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserEvents(resUserEvents.data);

        const resSavedEvents = await axios.get(
          `http://localhost:8000/api/events/saved/${user.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSavedEvents(resSavedEvents.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchEvents();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-6 text-gray-600 font-medium">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6 pt-32">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold mb-6 transition"
        >
          <ArrowLeft size={20} />
          Retour
        </button>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            Mon <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Profil</span>
          </h1>
          <p className="text-lg text-gray-600">Gérez vos événements et vos informations</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8 hover:shadow-xl transition">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <Avatar user={user} size="28" />
              {/* <button className="absolute bottom-0 right-0 p-2 bg-purple-600 rounded-full text-white hover:bg-purple-700 transition shadow-lg">
                <Edit size={16} />
              </button> */}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{user?.name}</h2>
              <div className="flex flex-col md:flex-row gap-3 text-gray-600 justify-center md:justify-start">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-purple-600" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-end">
                  <Clock size={16} className="text-purple-600" />
                  <span>Membre depuis 2025</span>
                </div>
              </div>
            </div>
            {/* <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:shadow-lg transition">
              Modifier le Profil
            </button> */}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="group bg-white p-6 rounded-2xl text-center shadow-lg border border-gray-100 hover:shadow-xl hover:border-purple-200 transition">
            <div className="inline-flex p-3 rounded-full bg-purple-100 mb-3 group-hover:bg-purple-200 transition">
              <Calendar className="text-purple-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{userEvents.length}</p>
            <p className="text-gray-600 mt-1 font-medium">Événements publiés</p>
          </div>
          <div className="group bg-white p-6 rounded-2xl text-center shadow-lg border border-gray-100 hover:shadow-xl hover:border-purple-200 transition">
            <div className="inline-flex p-3 rounded-full bg-purple-100 mb-3 group-hover:bg-purple-200 transition">
              <Bookmark className="text-purple-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{savedEvents.length}</p>
            <p className="text-gray-600 mt-1 font-medium">Événements sauvegardés</p>
          </div>
          <div className="group bg-white p-6 rounded-2xl text-center shadow-lg border border-gray-100 hover:shadow-xl hover:border-purple-200 transition">
            <div className="inline-flex p-3 rounded-full bg-purple-100 mb-3 group-hover:bg-purple-200 transition">
              <Heart className="text-purple-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-gray-600 mt-1 font-medium">Likes reçus</p>
          </div>
        </div>

        {/* Published Events */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Mes Événements</h3>
            <button className="px-4 py-2 text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-2 transition">
              <TrendingUp size={18} />
              Voir tout
            </button>
          </div>
          {userEvents.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100">
              <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium">Vous n'avez publié aucun événement</p>
              <button className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:shadow-lg transition">
                Créer mon premier événement
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userEvents.map((event) => (
                <div
                  key={event.id}
                  className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition border border-gray-100 hover:border-purple-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition">
                        <Calendar size={20} className="text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg group-hover:text-purple-600 transition">
                          {event.title}
                        </h4>
                        <p className="text-sm text-gray-500">{event.date}</p>
                      </div>
                    </div>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <MapPin size={14} className="text-purple-600" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saved Events */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Événements Sauvegardés</h3>
            <button className="px-4 py-2 text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-2 transition">
              <Bookmark size={18} />
              Voir tout
            </button>
          </div>
          {savedEvents.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100">
              <Bookmark size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium">Aucun événement sauvegardé</p>
              <p className="text-sm text-gray-500 mt-2">Explorez les événements et sauvegardez vos favoris</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedEvents.map((event) => (
                <div
                  key={event.id}
                  className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition border border-gray-100 hover:border-purple-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition">
                        <Calendar size={20} className="text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg group-hover:text-purple-600 transition">
                          {event.title}
                        </h4>
                        <p className="text-sm text-gray-500">{event.date}</p>
                      </div>
                    </div>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <MapPin size={14} className="text-purple-600" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}