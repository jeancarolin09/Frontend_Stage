import SignupForm from '../components/SignupForm.jsx'; // FIX: Ajout de l'extension .jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MoveLeft } from "lucide-react";
import { useAuth } from '../context/AuthContext.jsx'; // FIX: Ajout de l'extension .jsx

const Signup = () => {
   const [notification, setNotification] = useState({ message: '', type: '' });
   const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { setVerificationInfo } = useAuth(); // Fonction pour stocker le token et l'email

    const handleSignup = async (data) => {
        setIsSubmitting(true);
       setNotification({ message: '', type: '' });

        try {
            const response = await axios.post('http://localhost:8000/api/users', {
                name: data.fullName,
                email: data.email,
                password: data.password,
            });

            const { token, user } = response.data;
            
            // ⭐ STOCKAGE DES INFOS POUR LA PROCHAINE ÉTAPE
            setVerificationInfo({ email: user.email, token });

             setNotification({
                message: '✅ Inscription réussie ! Code de vérification envoyé à ' + user.email + '.',
                type: 'success'
            });

            // ⭐ REDIRECTION VERS LA PAGE DE VÉRIFICATION
            setTimeout(() => navigate('/verify-code'), 1500);

       } catch (error) {
            console.error(error);
            const errorMessage = error.response?.data?.message || 'Échec de l’inscription. Vérifiez vos informations.';
            setNotification({
                message: errorMessage,
                type: 'error'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        // Conteneur principal
        <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-white overflow-hidden flex items-center justify-center p-4">
            
            {/* Fond avec des formes abstraites pour l'effet visuel */}
            <div className="absolute inset-0 z-0 opacity-50">
                <svg className="w-full h-full" viewBox="0 0 1440 810" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="1000" cy="100" r="150" fill="url(#paint0_radial)" />
                    <circle cx="200" cy="700" r="100" fill="url(#paint1_radial)" />
                    <path d="M720 0L810 810L0 810L720 0Z" fill="url(#paint2_radial)" />
                    <defs>
                        <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1000 100) rotate(90) scale(150)">
                            <stop stopColor="#ADD8E6"/>
                            <stop offset="1" stopColor="#ADD8E6" stopOpacity="0"/>
                        </radialGradient>
                        <radialGradient id="paint1_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(200 700) rotate(90) scale(100)">
                            <stop stopColor="#FFC0CB"/>
                            <stop offset="1" stopColor="#FFC0CB" stopOpacity="0"/>
                        </radialGradient>
                        <radialGradient id="paint2_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(405 405) rotate(90) scale(405)">
                            <stop stopColor="#90EE90"/>
                            <stop offset="1" stopColor="#A9A9A9" stopOpacity="0"/>
                        </radialGradient>
                    </defs>
                </svg>
            </div>

            {/* Bouton retour Accueil
            <button
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 z-20 flex items-center gap-2 px-3 py-2 rounded-full bg-white/80 hover:bg-white text-gray-700 text-sm font-medium shadow-md transition-all duration-300 backdrop-blur-sm border border-gray-200"
                aria-label="Retour à la page d'accueil"
            >
                <MoveLeft size={18} /> Accueil
            </button> */}

            {/* Contenu principal de la page d'inscription */}
             <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-6xl mx-auto px-4 py-8 bg-white/90 rounded-2xl shadow-2xl border border-gray-100">
                 
                 <button
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 z-20 flex items-center gap-2 px-3 py-2 rounded-pill bg-white/80 hover:bg-white text-gray-700 text-sm font-medium shadow-md transition-all duration-300 backdrop-blur-sm border border-gray-200"
                aria-label="Retour à la page d'accueil"
            >
                <MoveLeft size={18} /> Accueil
            </button>

                {/* Section de bienvenue à gauche (texte sombre) */}
                <div className="text-gray-800 p-8">
                    {/* Logo ajusté pour le clair */}
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

                    <h2 className="text-6xl font-extrabold mb-4 animate-fadeIn">Commence maintenant !</h2>
                    <p className="text-gray-600 text-lg mb-8 max-w-md">
  Créez votre compte{" "}
  <span className="font-extrabold tracking-tight text-gray-900">
    <strong>Event</strong>
    <strong className="text-purple-600">Planner</strong>
  </span>{" "}
  pour organiser, planifier et gérer tous vos événements en quelques clics.
</p>
                    <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-pill shadow-lg hover:bg-red-700 transition duration-300">
                        Explore Features
                    </button>
                </div>

                {/* Formulaire d'inscription à droite */}
                <div className="w-full">
                    {/* Affichage du message avec couleur dynamique (rouge ou vert) */}
                    {notification.message && (
                        <p className={`text-center text-lg mb-4 font-bold animate-fadeIn ${
                            notification.type === 'error' ? 'text-red-600' : 'text-green-700'
                        }`}>
                            {notification.message}
                        </p>
                    )}
                    <SignupForm onSubmit={handleSignup} isSubmitting={isSubmitting} />
                    
                    {/* Lien Se connecter (couleurs ajustées) */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            Déjà un compte ?{' '}
                            <button
                                onClick={() => navigate('/login')}
                                className="text-red-600 hover:text-red-700 font-semibold transition duration-200"
                            >
                                Se connecter
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
       
    );
};

export default Signup;