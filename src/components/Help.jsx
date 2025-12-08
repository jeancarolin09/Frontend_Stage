import React, { useState } from 'react';
import { 
  ArrowLeft, HelpCircle, Mail, MessageCircle, 
  Book, Zap, Calendar, Users, Globe, 
  ChevronRight, CheckCircle, TrendingUp
} from 'lucide-react';

const Help = () => {
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'getting-started', label: 'Démarrage', icon: Zap },
    { id: 'events', label: 'Événements', icon: Calendar },
    { id: 'invitations', label: 'Invitations', icon: Mail },
    { id: 'messaging', label: 'Messages', icon: MessageCircle },
    { id: 'polls', label: 'Sondages', icon: TrendingUp },
    { id: 'account', label: 'Mon Compte', icon: Users }
  ];

  const faqs = {
    'getting-started': [
      {
        question: "Comment créer mon premier événement ?",
        answer: "Cliquez sur le bouton '+ Créer un événement' dans le Dashboard. Remplissez les informations (titre, date, lieu) et cliquez sur 'Créer'. Vous pouvez ensuite ajouter des invités et des sondages."
      },
      {
        question: "Comment inviter des personnes ?",
        answer: "Dans les détails de votre événement, allez dans l'onglet 'Invités', puis ajoutez les emails des personnes à inviter. Ils recevront un lien de confirmation par email."
      },
      {
        question: "Comment utiliser la carte pour définir un lieu ?",
        answer: "Lors de la création d'un événement, cliquez sur la carte interactive et placez le marqueur à l'endroit souhaité. Vous pouvez aussi rechercher une adresse directement."
      }
    ],
    'events': [
      {
        question: "Comment modifier un événement ?",
        answer: "Allez dans 'Mes Événements', cliquez sur l'événement, puis sur 'Modifier'. Changez les informations et sauvegardez."
      },
      {
        question: "Comment partager un événement publiquement ?",
        answer: "Dans la carte de votre événement, cliquez sur l'icône de partage pour rendre l'événement visible dans la section Découverte."
      },
      {
        question: "Comment supprimer un événement ?",
        answer: "Dans les détails de l'événement, cliquez sur le bouton de suppression (icône poubelle) et confirmez votre choix."
      }
    ],
    'invitations': [
      {
        question: "Comment répondre à une invitation ?",
        answer: "Allez dans 'Invitations', cliquez sur l'invitation et choisissez 'Accepter', 'Refuser' ou 'Peut-être'."
      },
      {
        question: "Comment voir les invités confirmés ?",
        answer: "Dans les détails de votre événement, l'onglet 'Invités' affiche le statut de chaque invité (confirmé, en attente, refusé)."
      }
    ],
    'messaging': [
      {
        question: "Comment envoyer un message ?",
        answer: "Cliquez sur 'Messages', sélectionnez un contact ou créez une nouvelle conversation avec le bouton '+'. Tapez votre message et envoyez."
      },
      {
        question: "Comment supprimer un message ?",
        answer: "Survolez votre message, cliquez sur les trois points et sélectionnez 'Supprimer'. Attention : cette action est irréversible."
      }
    ],
    'polls': [
      {
        question: "Comment créer un sondage ?",
        answer: "Dans les détails de votre événement, allez dans 'Sondages', cliquez sur 'Créer un sondage', ajoutez une question et des options, puis validez."
      },
      {
        question: "Comment voter sur un sondage ?",
        answer: "Dans l'invitation de l'événement, cliquez sur l'option de votre choix et validez. Vous pouvez modifier votre vote à tout moment."
      }
    ],
    'account': [
      {
        question: "Comment modifier ma photo de profil ?",
        answer: "Allez dans 'Mon Profil', cliquez sur l'icône caméra sur votre photo actuelle, sélectionnez une image et sauvegardez."
      },
      {
        question: "Comment changer mon mot de passe ?",
        answer: "Dans 'Paramètres', section 'Sécurité', entrez votre mot de passe actuel, puis le nouveau et confirmez."
      }
    ]
  };

  const quickLinks = [
    { icon: Book, label: "Guide Complet", desc: "Documentation détaillée", link: "#" },
    { icon: Mail, label: "Nous Contacter", desc: "support@eventplanner.com", link: "mailto:support@eventplanner.com" },
    { icon: MessageCircle, label: "Chat en Direct", desc: "Assistance instantanée", link: "#" },
    { icon: Globe, label: "Communauté", desc: "Forum & Discussions", link: "#" }
  ];

  const filteredFaqs = faqs[activeCategory].filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6 pt-32">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold mb-6 transition"
        >
          <ArrowLeft size={20} />
          Retour
        </button>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            Centre d'<span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Aide</span>
          </h1>
          <p className="text-lg text-gray-600">Trouvez rapidement les réponses à vos questions</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Rechercher une question..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 pl-12 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-lg"
            />
            <HelpCircle size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          {quickLinks.map((link, i) => {
            const Icon = link.icon;
            return (
              <a
                key={i}
                href={link.link}
                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition border border-gray-100 hover:border-purple-200 text-center"
              >
                <div className="inline-flex p-3 rounded-full bg-purple-100 mb-3 group-hover:bg-purple-200 transition">
                  <Icon size={24} className="text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{link.label}</h3>
                <p className="text-sm text-gray-600">{link.desc}</p>
              </a>
            );
          })}
        </div>

        {/* Categories + FAQs */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 sticky top-32">
              <h3 className="font-bold text-gray-900 mb-4 px-2">Catégories</h3>
              <div className="space-y-1">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-3 transition ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="text-sm font-semibold">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {filteredFaqs.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100">
                  <HelpCircle size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Aucune question trouvée</p>
                </div>
              ) : (
                filteredFaqs.map((faq, i) => (
                  <details key={i} className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition">
                    <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <CheckCircle size={20} className="text-purple-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 group-open:text-purple-600 transition flex-1">
                          {faq.question}
                        </h3>
                      </div>
                      <ChevronRight size={20} className="text-gray-400 group-open:rotate-90 transition" />
                    </summary>
                    <div className="px-6 pb-6 pl-20">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </details>
                ))
              )}
            </div>

            {/* Contact Support */}
            <div className="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center">
              <HelpCircle size={48} className="mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Besoin d'aide supplémentaire ?</h3>
              <p className="text-purple-100 mb-6">Notre équipe est là pour vous aider</p>
              <a
                href="mailto:support@eventplanner.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 font-semibold rounded-full hover:bg-purple-50 transition"
              >
                <Mail size={20} />
                Contacter le Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;