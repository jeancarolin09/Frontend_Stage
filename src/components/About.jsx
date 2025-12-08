import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Users, Heart, Shield, 
  MapPin, Clock, Award, TrendingUp, MessageCircle,
  Code, Sparkles, Twitter, Linkedin, Github
} from 'lucide-react';

const About = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calendar,
      title: "Planification Simplifiée",
      description: "Créez et gérez tous vos événements en quelques clics",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: MapPin,
      title: "Localisation Intégrée",
      description: "Carte interactive pour définir et partager les lieux",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: MessageCircle,
      title: "Messagerie Instantanée",
      description: "Discutez en temps réel avec vos invités",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Users,
      title: "Gestion des Invités",
      description: "Envoyez des invitations et suivez les RSVP",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: TrendingUp,
      title: "Sondages Interactifs",
      description: "Votez pour les meilleures options (lieu, menu, thème)",
      color: "from-purple-500 to-indigo-500"
    },
    {
      icon: Heart,
      title: "Social & Partage",
      description: "Aimez et commentez les événements de la communauté",
      color: "from-pink-500 to-rose-500"
    }
  ];

  const stats = [
    { icon: Users, label: "Utilisateurs Actifs", value: "10K+", color: "text-purple-600" },
    { icon: Calendar, label: "Événements Créés", value: "50K+", color: "text-blue-600" },
    { icon: Heart, label: "Interactions", value: "200K+", color: "text-pink-600" },
    { icon: Award, label: "Satisfaction", value: "98%", color: "text-green-600" }
  ];

  const team = [
    { 
      name: "Jean Carolin",
      role: "Fondateur & PDG", 
      avatar: "👨‍💻",
      bio: "A cœur de concevoir des événements parfaitement orchestrés.",
      social: { twitter: "#", linkedin: "#", github: "#" }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6 pt-32">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold mb-6 transition"
        >
          <ArrowLeft size={20} />
          Retour 
        </button>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-4">
            <Sparkles size={16} />
            Version 1.0.0
          </div>
          <h1 className="text-6xl font-extrabold text-gray-900 mb-4">
            Event<span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Planner</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            La plateforme tout-en-un pour organiser, partager et vivre des événements mémorables
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition border border-gray-100">
                <div className={`inline-flex p-3 rounded-full bg-gray-100 mb-3`}>
                  <Icon size={24} className={stat.color} />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Fonctionnalités Principales
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition border border-gray-100 hover:border-purple-200">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4 group-hover:scale-110 transition`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Notre Équipe
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {team.map((member, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition border border-gray-100">
                <div className="text-6xl mb-4">{member.avatar}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-purple-600 font-semibold mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                <div className="flex justify-center gap-3">
                  <a href={member.social.twitter} className="p-2 bg-gray-100 rounded-full hover:bg-purple-100 transition">
                    <Twitter size={18} className="text-gray-700" />
                  </a>
                  <a href={member.social.linkedin} className="p-2 bg-gray-100 rounded-full hover:bg-purple-100 transition">
                    <Linkedin size={18} className="text-gray-700" />
                  </a>
                  <a href={member.social.github} className="p-2 bg-gray-100 rounded-full hover:bg-purple-100 transition">
                    <Github size={18} className="text-gray-700" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 text-white text-center mb-12">
          <Code size={48} className="mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Construit avec les meilleures technologies</h2>
          <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
            React, Symfony, Doctrine ORM, Leaflet Maps, JWT Authentication, et bien plus encore
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['React', 'Symfony', 'MySql', 'Tailwind CSS', 'Leaflet'].map((tech, i) => (
              <span key={i} className="px-4 py-2 bg-white/20 backdrop-blur rounded-full text-sm font-semibold">
                {tech}
              </span>
            ))}
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default About;