import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoginForm from "../components/LoginForm";
import { useAuth } from "../context/AuthContext";
import { MoveLeft } from "lucide-react"; // Nouvelle icône pour le bouton Retour


const Login = () => {
  const [notification, setNotification] = useState({ message: "", type: "" });
 const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();


  const handleLogin = async (data) => {
    setIsSubmitting(true);
    setNotification({ message: "", type: "" });

    try {
      const response = await axios.post(
        "http://localhost:8000/api/login_check",
        {
          email: data.email,
          password: data.password,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const { token, user } = response.data;

      if (token && user) {
        login(token, user);
        setNotification({ 
                  message: `Bienvenue ${user.name || user.email.split('@')[0]} !`, 
                  type: 'success' // Message de succès
                });
        navigate("/dashboard");
        setNotification({ 
        message: `Bienvenue ${user.name || user.email.split('@')[0]} !`, 
         type: 'success'
 });
      }
    } catch (error) {
      console.error("Erreur:", error);
      setNotification({ 
        message: "Email ou mot de passe incorrect.", 
        type: 'error' // Message d'erreur
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Conteneur principal: fond dégradé et positionnement du contenu
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-white overflow-hidden flex items-center justify-center p-4">
      {/* Fond avec des formes abstraites pour l'effet visuel */}
      <div className="absolute inset-0 z-0 opacity-50">
        <svg className="w-full h-full" viewBox="0 0 1440 810" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* SVG existant pour le fond... (inchangé) */}
          <circle cx="1000" cy="100" r="150" fill="url(#paint0_radial)" />
          <circle cx="200" cy="700" r="100" fill="url(#paint1_radial)" />
          <path d="M720 0L810 810L0 810L720 0Z" fill="url(#paint2_radial)" />
         <defs>
            <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1000 100) rotate(90) scale(150)">
              <stop stopColor="#ADD8E6"/> {/* Bleu clair */}
              <stop offset="1" stopColor="#ADD8E6" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="paint1_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(200 700) rotate(90) scale(100)">
              <stop stopColor="#FFC0CB"/> {/* Rose clair */}
              <stop offset="1" stopColor="#FFC0CB" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="paint2_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(405 405) rotate(90) scale(405)">
              <stop stopColor="#90EE90"/> {/* Vert clair */}
              <stop offset="1" stopColor="#A9A9A9" stopOpacity="0"/>
            </radialGradient>
          </defs>
        </svg>
      </div>


     <button
  onClick={() => navigate("/")}
  className="absolute top-6 left-6 flex items-center gap-2 px-3 py-2 rounded-pill bg-white/80 hover:bg-white text-gray-700 text-sm font-medium shadow-sm transition-all duration-300 backdrop-blur-sm border border-gray-200"
  aria-label="Retour à la page d'accueil"
>
  <MoveLeft size={18} /> <span>Accueil</span>
</button>

      {/* Contenu principal de la page de connexion */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-6xl mx-auto px-4 py-8 bg-white/90 rounded-2xl shadow-2xl border border-gray-100">
        {/* Section de bienvenue à gauche */}
        <div className="text-gray-800 p-8">
          {/* Logo 'li' ou 'studio' */}
          <div className="mb-8 relative flex items-center gap-3">
  {/* Symbole du logo */}
  <div className="relative w-12 h-12 flex items-center justify-center">
    {/* Bloc principal */}
    <span className="w-10 h-10 bg-purple-600 rounded-md drop-shadow-lg transform rotate-12"></span>
    {/* Bloc secondaire pour effet dynamique */}
    <span className="w-6 h-6 bg-pink-500 block rounded-md absolute top-1 left-1 transform rotate-45 shadow-md shadow-pink-400/40"></span>
  </div>

  {/* Texte EventPlanner */}
  <span className="text-3xl font-extrabold text-gray-900 drop-shadow-md tracking-tight">
    Event<span className="text-purple-600">Planner</span>
  </span>
</div>
          <h2 className="text-6xl font-extrabold mb-4 animate-fadeIn">Content de te revoir !</h2>
          
          {/* CHANGEMENT 1: Nouveau texte de description */}
          <p className="text-gray-800 text-lg mb-8 max-w-md">
            Connectez-vous à votre espace personnel **EventPlanner** pour accéder à tous vos outils de planification. Gagnez du temps et gérez vos événements en toute simplicité.
          </p>
          
          {/* CHANGEMENT 2: Bouton S'inscrire */}
          <button 
            onClick={() => navigate("/signup")}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-pill shadow-lg hover:bg-pink-100 transition duration-300"
          >
            Créer un compte
          </button>

            {/* CHANGEMENT 3: Lien Mot de passe oublié */}
            <div className="mt-6">
                <button
                    onClick={() => navigate("/forgot-password")}
                    className="text-sm text-gray-500 hover:text-red-600 transition duration-200 underline"
                >
                    Mot de passe oublié ?
                </button>
            </div>
        </div>

        {/* Formulaire de connexion à droite */}
        <div className="w-full">
          {notification.message && (
            <p className={`text-center text-lg mb-4 font-bold animate-fadeIn ${
                notification.type === 'error' ? 'text-red-600' : 'text-green-700'
            }`}>
              {notification.message}
            </p>
          )}
          <LoginForm onSubmit={handleLogin} isSubmitting={isSubmitting} />
        </div>
      </div>
    </div>
 );
};

export default Login;
