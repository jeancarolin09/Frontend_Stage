import React, { useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
    ArrowLeft, Calendar, Clock, MapPin, Send, Loader, Image as ImageIcon,
    AlertCircle, CheckCircle, Upload, Map as MapIcon, Eye
} from "lucide-react";
import MapPicker from '../components/MapPicker';

const CreateEvent = () => {

    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);

    const [activeTab, setActiveTab] = useState("info");

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        latitude: null,
        longitude: null,
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Le fichier doit être une image.");
            return;
        }

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleMapLocationChange = (lat, lng) => {
        setFormData({
            ...formData,
            latitude: parseFloat(lat),
            longitude: parseFloat(lng)
        });
    };

    const validateForm = () => {
        if (!formData.title.trim()) return "Le titre est obligatoire";
        if (!formData.date) return "La date est obligatoire";
        if (!formData.time) return "L’heure est obligatoire";
        if (!formData.location.trim()) return "Le lieu est obligatoire";
        if (!formData.latitude || !formData.longitude) return "Sélectionnez un point sur la carte";
        return null;
    };

    const handleSubmit = async () => {
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        const eventDateTime = new Date(`${formData.date}T${formData.time}`);
        if (eventDateTime < new Date()) {
            setError("Impossible de créer un événement dans le passé.");
            return;
        }

        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('jwt');
            const data = new FormData();
            data.append("title", formData.title);
            data.append("description", formData.description || '');
            data.append("event_date", formData.date);
            data.append("event_time", formData.time);
            data.append("event_location", formData.location);
            data.append("latitude", formData.latitude);
            data.append("longitude", formData.longitude);

            if (imageFile) data.append("image", imageFile);

            await axios.post("http://localhost:8000/api/events", data, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json",
                }
            });

            setSuccess("Événement créé avec succès !");
            queryClient.invalidateQueries({ queryKey: ["events"] });

            setTimeout(() => navigate("/dashboard"), 1000);

        } catch (err) {
            setError("Erreur lors de la création de l’événement");
        }

        setLoading(false);
    };

    return (
        <main className="flex-1 overflow-y-auto pl-24 pt-30">
            <div className="max-w-5xl mx-auto pb-20">

                {/* 🔙 RETOUR */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-purple-500 mb-8 font-semibold hover:text-purple-700 transition"
                >
                    <ArrowLeft size={20} />
                    Retour au Dashboard
                </button>

                {/* HEADER */}
                <h1 className="text-4xl font-extrabold mb-1 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                    Créer un Événement
                </h1>
                <p className="text-gray-500 mb-8">Configure ton événement étape par étape.</p>

                {/* CARD */}
                <div className="bg-white rounded-2xl border shadow-lg overflow-hidden">

                    {/* ⭐ NAV TABS */}
                    <div className="flex border-b bg-gray-50">
                        {[
                            { id: "info", icon: Calendar, label: "Informations" },
                            { id: "image", icon: ImageIcon, label: "Image" },
                            { id: "location", icon: MapIcon, label: "Localisation" },
                            { id: "preview", icon: Eye, label: "Aperçu" },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 font-medium 
                                    ${activeTab === tab.id
                                        ? "border-b-4 border-purple-500 text-purple-600"
                                        : "text-gray-600 hover:text-gray-900"}`
                                }
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* CONTENT */}
                    <div className="p-8">

                        {/* ⚠️ ERREUR */}
                        {error && (
                            <div className="flex items-center gap-3 mb-6 p-4 bg-red-100 border border-red-300 rounded-xl text-red-700">
                                <AlertCircle size={20} />
                                {error}
                            </div>
                        )}

                        {/* ✅ SUCCESS */}
                        {success && (
                            <div className="flex items-center gap-3 mb-6 p-4 bg-green-100 border border-green-300 rounded-xl text-green-700">
                                <CheckCircle size={20} />
                                {success}
                            </div>
                        )}

                        {/* 🔹 TAB 1 : INFO */}
                        {activeTab === "info" && (
                            <div className="space-y-6">

                                <div className="space-y-2">
                                    <label className="font-semibold">Titre *</label>
                                    <input
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border rounded-xl"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="font-semibold">Description</label>
                                    <textarea
                                        name="description"
                                        rows={4}
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border rounded-xl resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="font-semibold">Date *</label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            min={new Date().toISOString().split("T")[0]}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border rounded-xl"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="font-semibold">Heure *</label>
                                        <input
                                            type="time"
                                            name="time"
                                            value={formData.time}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="font-semibold">Lieu *</label>
                                    <input
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border rounded-xl"
                                    />
                                </div>

                            </div>
                        )}

                        {/* 🔹 TAB 2 : IMAGE */}
                        {activeTab === "image" && (
                            <div className="space-y-4">

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />

                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    className="flex items-center gap-2 px-4 py-3 bg-purple-100 text-purple-700 border border-purple-300 rounded-xl hover:bg-purple-200"
                                >
                                    <Upload size={18} />
                                    {imageFile ? imageFile.name : "Sélectionner une image"}
                                </button>

                                {imagePreview && (
                                    <img
                                        src={imagePreview}
                                        className="w-full max-h-64 object-cover rounded-xl shadow-md"
                                    />
                                )}
                            </div>
                        )}

                        {/* 🔹 TAB 3 : LOCALISATION */}
                        {activeTab === "location" && (
                            <div className="space-y-4">
                                <label className="font-semibold flex items-center gap-2">
                                    <MapPin size={18} />
                                    Position GPS *
                                </label>

                                <MapPicker
                                    onLocationChange={handleMapLocationChange}
                                    initialLatitude={formData.latitude}
                                    initialLongitude={formData.longitude}
                                />

                                {formData.latitude && (
                                    <p className="text-sm text-gray-500 mt-2">
                                        Lat: {formData.latitude.toFixed(4)} — Lng: {formData.longitude.toFixed(4)}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* 🔹 TAB 4 : APERÇU */}
                        {activeTab === "preview" && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold">Aperçu</h3>

                                {imagePreview && (
                                    <img
                                        src={imagePreview}
                                        className="w-full max-h-64 object-cover rounded-xl"
                                    />
                                )}

                                <div className="p-4 rounded-xl border bg-gray-50">
                                    <p><strong>Titre :</strong> {formData.title}</p>
                                    <p><strong>Date :</strong> {formData.date}</p>
                                    <p><strong>Heure :</strong> {formData.time}</p>
                                    <p><strong>Lieu :</strong> {formData.location}</p>
                                </div>
                            </div>
                        )}

                        {/* 🚀 SUBMIT */}
                        <div className="pt-8">
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
                            >
                                {loading ? (
                                    <>
                                        <Loader size={20} className="animate-spin" />
                                        Création…
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        Créer l’Événement
                                    </>
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
};

export default CreateEvent;
