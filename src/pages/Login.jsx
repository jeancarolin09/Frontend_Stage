import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoginForm from "../components/LoginForm";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (data) => {
  setIsSubmitting(true);
  setMessage("");

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
      // ✅ On sauvegarde le token et le user dans le contexte
      login(token, user);
      navigate("/dashboard");
      setMessage(`Bienvenue ${user.name} !`);
    }
  } catch (error) {
    console.error("Erreur:", error);
    setMessage("Email ou mot de passe incorrect.");
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div>
      <div className="absolute top-6 left-6">
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-purple-300 text-white rounded-xl shadow hover:bg-blue-200 transition duration-300"
        >
          ← Accueil
        </button>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Bienvenue !</h2>
        <p className="text-gray-600">Connectez-vous pour continuer</p>
      </div>

      {message && (
        <p className="text-center text-green-600 text-2xl mb-4 font-bold animate-fadeIn">
          {message}
        </p>
      )}

      <LoginForm onSubmit={handleLogin} isSubmitting={isSubmitting} />

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Pas encore de compte ?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            S'inscrire
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
