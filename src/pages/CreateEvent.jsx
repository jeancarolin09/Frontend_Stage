import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowLeft, Calendar, Clock, MapPin } from "lucide-react";

const CreateEvent = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    // Vérification des champs obligatoires
    if (!formData.title || !formData.date || !formData.time) {
      setError("Veuillez remplir tous les champs obligatoires !");
      return;
    }

    const token = localStorage.getItem('jwt');
    if (!token) {
      setError("Utilisateur non authentifié");
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Appel API
      await axios.post(
        'http://localhost:8000/api/events',
        {
          title: formData.title,
          description: formData.description,
          event_date: formData.date,   // ⚡ correspond à ton API Symfony
          event_time: formData.time,   // ⚡ correspond à ton API Symfony
          event_location: formData.location
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      // Rafraîchir la liste des événements
      queryClient.invalidateQueries({ queryKey: ['events'] });

      // Réinitialiser le formulaire et naviguer
      setFormData({ title: '', description: '', date: '', time: '', location: '' });
      navigate('/dashboard');

    } catch (err) {
      // Affiche le message d'erreur renvoyé par Symfony
      setError(err.response?.data?.message || 'Erreur lors de la création de l’événement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-24 px-4">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-purple-600 font-semibold mb-6 hover:underline"
      >
        <ArrowLeft size={18} />
        Retour au Dashboard
      </button>

      <h2 className="text-3xl font-bold text-gray-800 mb-8">Créer un Événement</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div>
          <label className="block mb-2 font-semibold text-gray-700">Titre *</label>
          <input
            type="text"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Ex: Anniversaire de Max"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold text-gray-700">Description *</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={4}
            placeholder="Décrivez votre événement..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block mb-2 font-semibold text-gray-700">Date *</label>
            <Calendar size={16} className="absolute top-10 left-3 text-gray-400" />
            <input
              type="date" 
              value={formData.date} 
              onChange={e => setFormData({...formData, date:e.target.value})} 
              className="w-full border border-gray-300 rounded-lg px-10 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="relative">
            <label className="block mb-2 font-semibold text-gray-700">Heure *</label>
            <Clock size={16} className="absolute top-10 left-3 text-gray-400"/>
            <input 
              type="time" 
              value={formData.time} 
              onChange={e => setFormData({...formData, time:e.target.value})} 
              className="w-full border border-gray-300 rounded-lg px-10 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="relative">
          <label className="block mb-2 font-semibold text-gray-700">Lieu</label>
          <MapPin size={16} className="absolute top-10 left-3 text-gray-400"/>
          <input 
            type="text" 
            value={formData.location} 
            onChange={e => setFormData({...formData, location:e.target.value})} 
            placeholder="Adresse ou nom du lieu"
            className="w-full border border-gray-300 rounded-lg px-10 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <button 
          onClick={handleSubmit} 
          disabled={loading}
          className={`w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Création...' : 'Créer l\'Événement'}
        </button>
      </div>
    </div>
  );
};

export default CreateEvent;
