import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const InputField = ({ label, type, name, value, onChange, placeholder, icon: Icon, error, showPasswordToggle }) => (
  <div className="relative">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />}
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full pl-10 pr-12 py-3 border rounded-xl outline-none transition duration-200 ${
        error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
      } focus:ring-2 focus:border-transparent bg-white`}
      aria-invalid={!!error}
    />
    {showPasswordToggle && (
      <button
        type="button"
        onClick={showPasswordToggle.onClick}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        aria-label={showPasswordToggle.label}
      >
        {showPasswordToggle.icon}
      </button>
    )}
    {error && <p className="text-red-500 text-sm mt-1 animate-fadeIn">{error}</p>}
  </div>
);

const LoginForm = ({ onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide';
    if (!formData.password) newErrors.password = 'Le mot de passe est requis';
    else if (formData.password.length < 6) newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
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
    if (validateForm()) onSubmit({ ...formData, rememberMe });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <form className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6" onSubmit={handleSubmit}>
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Se connecter</h2>

        <InputField
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="votre@email.com"
          icon={Mail}
          error={errors.email}
        />

        <InputField
          label="Mot de passe"
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          icon={Lock}
          error={errors.password}
          showPasswordToggle={{
            onClick: () => setShowPassword(!showPassword),
            icon: showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />,
            label: showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe',
          }}
        />

        <div className="flex items-center justify-between text-sm text-gray-600">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(prev => !prev)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2">Se souvenir de moi</span>
          </label>
          <a href="#" className="text-blue-600 hover:underline">Mot de passe oublié ?</a>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
