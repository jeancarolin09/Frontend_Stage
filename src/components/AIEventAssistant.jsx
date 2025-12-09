import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, Sparkles, Calendar, MapPin, Clock, CheckCircle, X, Bot, Upload, Map, Image as ImageIcon } from 'lucide-react';
import MapPicker from './MapPicker';

const AIEventAssistant = ({ onEventCreated, onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Bonjour ! 👋 Je suis votre assistant pour créer des événements. Décrivez-moi votre événement avec le maximum de détails : titre, date, heure, lieu et description. Par exemple : 'Soirée d'anniversaire stylée le 25 décembre à 19h chez moi, on va danser toute la nuit !'",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    latitude: null,
    longitude: null
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [step, setStep] = useState('conversation');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Le fichier doit être une image.");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: "Super ! J'ai bien reçu votre image. 📸",
      timestamp: new Date()
    }]);
  };

  const handleMapLocationChange = (lat, lng) => {
    const newLat = parseFloat(lat);
    const newLng = parseFloat(lng);

    setExtractedData(prev => ({
      ...prev,
      latitude: isNaN(newLat) ? null : newLat,
      longitude: isNaN(newLng) ? null : newLng,
    }));
  };

  const extractEventInfo = (text) => {
    const data = { ...extractedData };
    
    // Extraction de la date
    const datePatterns = [
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
      /le (\d{1,2}) (janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)/i,
      /(demain|aujourd'hui|ce soir)/i,
      /(\d{4})-(\d{2})-(\d{2})/,
      /(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche) prochain/i
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        if (match[0].includes('-') && match[0].length === 10) {
          data.date = match[0];
        } else if (match[1] === 'demain' || match[1] === 'ce soir') {
          const tomorrow = new Date();
          if (match[1] === 'demain') tomorrow.setDate(tomorrow.getDate() + 1);
          data.date = tomorrow.toISOString().split('T')[0];
        } else if (match[1] === "aujourd'hui") {
          data.date = new Date().toISOString().split('T')[0];
        } else if (match[2]) {
          const months = {
            janvier: '01', février: '02', mars: '03', avril: '04',
            mai: '05', juin: '06', juillet: '07', août: '08',
            septembre: '09', octobre: '10', novembre: '11', décembre: '12'
          };
          const day = match[1].padStart(2, '0');
          const month = months[match[2].toLowerCase()];
          const year = new Date().getFullYear();
          data.date = `${year}-${month}-${day}`;
        } else if (match[1]) {
          // Jour de la semaine prochain
          const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
          const targetDay = days.indexOf(match[1].toLowerCase());
          if (targetDay !== -1) {
            const today = new Date();
            const currentDay = today.getDay();
            let daysToAdd = targetDay - currentDay;
            if (daysToAdd <= 0) daysToAdd += 7;
            const nextDate = new Date(today);
            nextDate.setDate(today.getDate() + daysToAdd);
            data.date = nextDate.toISOString().split('T')[0];
          }
        }
        break;
      }
    }

    // Extraction de l'heure
    const timePatterns = [
      /(\d{1,2})h(\d{2})?/,
      /(\d{1,2}):(\d{2})/,
      /à (\d{1,2}) heures?/i
    ];

    for (const pattern of timePatterns) {
      const match = text.match(pattern);
      if (match) {
        const hour = match[1].padStart(2, '0');
        const minute = (match[2] || '00').padStart(2, '0');
        data.time = `${hour}:${minute}`;
        break;
      }
    }

    // Extraction du lieu
    const locationMatch = text.match(/(à|chez|au|dans|sur) ([^,\n\.]+)/i);
    if (locationMatch) {
      data.location = locationMatch[2].trim();
    }

    // Extraction du titre
    if (!data.title) {
      const titlePatterns = [
        /^(.+?) (le|à|du|pour|ce|demain)/i,
        /^(.+?)[,\.]/,
        /^(.{5,60})/
      ];
      
      for (const pattern of titlePatterns) {
        const match = text.match(pattern);
        if (match && match[1].length > 3) {
          data.title = match[1].trim();
          break;
        }
      }
    }

    // Extraction de la description (tout ce qui reste après les infos principales)
    if (!data.description && text.length > 20) {
      const cleanedText = text
        .replace(/le \d{1,2} \w+/i, '')
        .replace(/\d{1,2}h\d{0,2}/g, '')
        .replace(/(à|chez|au|dans) \w+/i, '')
        .trim();
      
      if (cleanedText.length > 10) {
        data.description = cleanedText;
      }
    }

    return data;
  };

  const generateResponse = (userInput, currentData) => {
    const missingFields = [];
    if (!currentData.title) missingFields.push('titre');
    if (!currentData.date) missingFields.push('date');
    if (!currentData.time) missingFields.push('heure');
    if (!currentData.location) missingFields.push('lieu');

    if (missingFields.length === 0) {
      if (!currentData.latitude || !currentData.longitude) {
        return {
          message: "Excellent ! 🎉 J'ai presque tout. Pouvez-vous maintenant définir la position GPS sur la carte pour finaliser ? Cliquez sur le bouton carte ci-dessous.",
          complete: false,
          needsMap: true
        };
      }
      return {
        message: "Parfait ! 🎉 J'ai toutes les informations. Vérifiez l'aperçu et créez votre événement !",
        complete: true
      };
    }

    const responses = [
      `Super début ! Il me manque : ${missingFields.join(', ')}. Pouvez-vous compléter ? 😊`,
      `Bien noté ! Pour continuer, j'ai besoin de : ${missingFields.join(', ')}.`,
      `Merci ! Ajoutez-moi : ${missingFields.join(', ')} pour finaliser.`
    ];

    return {
      message: responses[Math.floor(Math.random() * responses.length)],
      complete: false,
      needsMap: false
    };
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const newData = extractEventInfo(userInput);
      
      const mergedData = {
        title: newData.title || extractedData.title,
        description: newData.description || extractedData.description,
        date: newData.date || extractedData.date,
        time: newData.time || extractedData.time,
        location: newData.location || extractedData.location,
        latitude: extractedData.latitude,
        longitude: extractedData.longitude
      };

      setExtractedData(mergedData);

      const response = generateResponse(userInput, mergedData);

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      }]);

      if (response.complete) {
        setTimeout(() => setStep('preview'), 1000);
      }

    } catch (error) {
      console.error('Erreur:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Je n'ai pas bien compris. Reformulez avec plus de détails (titre, date, heure, lieu) 😊",
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    setStep('creating');
    try {
      const token = localStorage.getItem('jwt');
      
      const formData = new FormData();
      formData.append('title', extractedData.title);
      formData.append('description', extractedData.description || `Événement créé avec l'assistant IA 🤖`);
      formData.append('event_date', extractedData.date);
      formData.append('event_time', extractedData.time);
      formData.append('event_location', extractedData.location);
      formData.append('latitude', extractedData.latitude || 0);
      formData.append('longitude', extractedData.longitude || 0);
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await fetch('http://localhost:8000/api/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const event = await response.json();
        onEventCreated?.(event);
      } else {
        throw new Error('Erreur lors de la création');
      }
    } catch (error) {
      alert('Erreur: ' + error.message);
      setStep('preview');
    }
  };

  if (step === 'preview') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle size={32} />
                <div>
                  <h2 className="text-2xl font-bold">Aperçu de votre événement</h2>
                  <p className="text-purple-100">Vérifiez tout avant de créer</p>
                </div>
              </div>
              <button onClick={() => setStep('conversation')} className="p-2 hover:bg-white/20 rounded-lg">
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {imagePreview && (
              <div className="relative">
                <img src={imagePreview} alt="Aperçu" className="w-full h-64 object-cover rounded-lg" />
                <button
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 text-purple-700 font-semibold mb-2">
                <Calendar size={20} />
                <span>Titre</span>
              </div>
              <p className="text-gray-900 font-bold text-xl">{extractedData.title}</p>
            </div>

            {extractedData.description && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="font-semibold text-gray-700 mb-2">Description</div>
                <p className="text-gray-600">{extractedData.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-blue-700 font-semibold mb-2">
                  <Calendar size={18} />
                  <span className="text-sm">Date</span>
                </div>
                <p className="text-gray-900 font-semibold">
                  {extractedData.date ? new Date(extractedData.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Non définie'}
                </p>
              </div>

              <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                <div className="flex items-center gap-2 text-pink-700 font-semibold mb-2">
                  <Clock size={18} />
                  <span className="text-sm">Heure</span>
                </div>
                <p className="text-gray-900 font-semibold">{extractedData.time || 'Non définie'}</p>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                <MapPin size={18} />
                <span className="text-sm">Lieu</span>
              </div>
              <p className="text-gray-900 font-semibold">{extractedData.location || 'Non défini'}</p>
              {extractedData.latitude && extractedData.longitude && (
                <p className="text-xs text-gray-500 mt-1">
                  GPS: {extractedData.latitude.toFixed(4)}, {extractedData.longitude.toFixed(4)}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleCreateEvent}
                disabled={!extractedData.latitude || !extractedData.longitude}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✨ Créer l'événement
              </button>
              <button
                onClick={() => setStep('conversation')}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'creating') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 text-center">
          <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-xl font-bold text-gray-900">Création en cours...</p>
          <p className="text-sm text-gray-500 mt-2">Préparation de votre événement ✨</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Bot size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Assistant IA</h2>
                <p className="text-purple-100">Créez votre événement en discutant</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl p-4 ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                  : 'bg-white border border-gray-200 text-gray-900'
              }`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2 text-purple-600">
                    <Sparkles size={16} />
                    <span className="text-xs font-bold">Assistant IA</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-purple-100' : 'text-gray-400'}`}>
                  {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl p-4">
                <Loader className="animate-spin text-purple-600" size={20} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-gray-200 space-y-3">
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition"
              title="Ajouter une image"
            >
              <ImageIcon size={20} />
            </button>
            <button
              onClick={() => setShowMapPicker(!showMapPicker)}
              className="p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
              title="Définir la position GPS"
            >
              <Map size={20} />
            </button>
            <button
              onClick={() => setStep('preview')}
              disabled={!extractedData.title || !extractedData.date}
              className="p-3 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition disabled:opacity-50"
              title="Voir l'aperçu"
            >
              <CheckCircle size={20} />
            </button>
          </div>

          {showMapPicker && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <MapPicker
                onLocationChange={handleMapLocationChange}
                initialLatitude={extractedData.latitude}
                initialLongitude={extractedData.longitude}
              />
            </div>
          )}

          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ex: Soirée d'anniversaire stylée le 25 décembre à 19h chez moi..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIEventAssistant;