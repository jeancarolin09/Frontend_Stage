import { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

const SignupForm = ({ onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName) newErrors.fullName = 'Le nom complet est requis';
    else if (formData.fullName.length < 3) newErrors.fullName = 'Le nom doit contenir au moins 3 caractères';

    if (!formData.email) newErrors.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide';

    if (!formData.password) newErrors.password = 'Le mot de passe est requis';
    else if (formData.password.length < 8) newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Veuillez confirmer le mot de passe';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';

    if (!acceptTerms) newErrors.terms = 'Vous devez accepter les conditions';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) onSubmit(formData);
  };

  return (
    <div className="min-h-150 flex items-center justify-center bg-gradient-to-r from-green-100 via-white to-green-100 p-2 rounded-xl">
      <form
        className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6"
        onSubmit={handleSubmit}
      >
        <h2 className="text-3xl font-bold text-gray-800 text-center">Créer un compte</h2>

        {/* Nom complet */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Votre nom complet"
              className={`w-full pl-10 pr-4 py-3 border ${
                errors.fullName ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition`}
            />
          </div>
          {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="votre@email.com"
              className={`w-full pl-10 pr-4 py-3 border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition`}
            />
          </div>
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Mot de passe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full pl-10 pr-12 py-3 border ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        {/* Confirmation mot de passe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full pl-10 pr-12 py-3 border ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
        </div>

        {/* Conditions */}
        <div>
          <div className="flex items-start">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => {
                setAcceptTerms(e.target.checked);
                if (errors.terms) setErrors(prev => ({ ...prev, terms: '' }));
              }}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1"
            />
            <span className="ml-2 text-sm text-gray-600">
              J'accepte les{' '}
              <a href="#" className="text-green-600 hover:text-green-700">
                conditions d'utilisation
              </a>{' '}
              et la{' '}
              <a href="#" className="text-green-600 hover:text-green-700">
                politique de confidentialité
              </a>
            </span>
          </div>
          {errors.terms && <p className="text-red-500 text-sm mt-1">{errors.terms}</p>}
        </div>

        {/* Bouton */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Création en cours...' : 'Créer un compte'}
        </button>
      </form>
    </div>
  );
};

export default SignupForm;
