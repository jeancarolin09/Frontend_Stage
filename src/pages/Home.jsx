import React from "react";
import { Calendar, Users, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: <Calendar size={36} className="text-purple-600 mb-4" />,
    title: "Créer des événements",
    description:
      "Planifiez vos événements en quelques clics et ajoutez tous les détails importants.",
  },
  {
    icon: <Users size={36} className="text-purple-600 mb-4" />,
    title: "Inviter vos amis",
    description:
      "Envoyez des invitations par email et suivez les confirmations de vos invités.",
  },
  {
    icon: <CheckCircle2 size={36} className="text-purple-600 mb-4" />,
    title: "Créer des sondages",
    description:
      "Organisez des sondages pour décider ensemble du restaurant, lieu ou date idéale.",
  },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex flex-col font-sans overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Calendar className="text-purple-600" size={36} />
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
              EventPlanner
            </h1>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 rounded-lg border border-purple-600 text-purple-600 hover:bg-purple-100 transition duration-300">
              FR / EN
            </button>
            <Link
              to="/login"
              className="px-5 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition duration-300 shadow-md hover:shadow-lg hover:no-underline"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 md:py-24">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-800 mb-4 leading-tight">
          Organisez vos événements facilement
        </h2>
        <p className="text-gray-600 mb-10 max-w-2xl text-lg md:text-xl">
          EventPlanner vous permet de créer, gérer et inviter vos amis à tous vos
          événements. Suivez les confirmations et créez des sondages pour prendre
          des décisions rapidement.
        </p>

        <Link
          to="/signup"
          className="bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-purple-700 transition transform hover:scale-105 shadow-lg hover:shadow-xl duration-300 hover:decoration-none"
        >
          Créer un compte
        </Link>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl w-full">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition transform hover:scale-105 cursor-pointer duration-300 flex flex-col items-center text-center"
            >
              {feature.icon}
              <h3 className="font-bold text-2xl mb-3 text-gray-800">{feature.title}</h3>
              <p className="text-gray-600 text-base md:text-lg">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-inner py-6 mt-16 text-center text-gray-500 text-sm md:text-base">
        © 2025 EventPlanner. Tous droits réservés.
      </footer>
    </div>
  );
};

export default Home;
