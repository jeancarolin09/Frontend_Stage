import SignupForm from '../components/SignUpForm';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (data) => {
    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await axios.post('http://localhost:8000/api/users', {
        name: data.fullName,
        email: data.email,
        password: data.password,
      });

      setMessage('✅Inscription réussie ! Vous allez être redirigé vers la page de connexion.');

      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      console.error(error);
      setMessage('Échec de l’inscription. Vérifiez vos informations.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
       {/* Bouton retour accueil */}
       <div className="absolute top-6 left-6">
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-purple-300 text-white rounded-xl shadow hover:bg-blue-200 transition duration-300"
        >
          ← Accueil
        </button>
      </div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Bienvenue !</h2>
        <p className="text-gray-600">Créez un compte pour commencer</p>
      </div>

      {message && (
        <p className="text-center text-green-600 text-2xl mb-4 font-bold animate-fadeIn">
          {message}
        </p>
      )}

      <SignupForm onSubmit={handleSignup} isSubmitting={isSubmitting} />
     <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Déjà un compte ?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-green-600 hover:text-green-700 font-semibold"
          >
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
