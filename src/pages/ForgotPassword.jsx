import { useState } from "react";
import axios from "axios";
import { MoveLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [notification, setNotification] = useState("");
  const [loading, setLoading] = useState(false);

  const sendResetCode = async () => {
    setLoading(true);
    try {
      await axios.post("http://localhost:8000/api/forgot-password", { email });
      setNotification("✅ Un code vous a été envoyé par email.");
      setStep(2);
    } catch (err) {
      setNotification("❌ Email introuvable.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      await axios.post("http://localhost:8000/api/reset-password", {
        email,
        code,
        newPassword
      });
      setNotification("✅ Mot de passe changé !");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setNotification("❌ Code invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6 relative">
      
      {/* Bouton retour */}
      <button
        onClick={() => navigate("/login")}
        className="absolute top-6 left-6 flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold transition"
      >
        <MoveLeft size={18} /> Retour
      </button>

      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4 text-center">
          Mot de passe oublié
        </h2>

        {notification && (
          <p className="text-center text-sm text-gray-700 mb-6">{notification}</p>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Votre email"
              className="w-full px-4 py-3  border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div></div>
            <button
              onClick={sendResetCode}
              disabled={loading || !email}
              className={`w-full py-3  rounded-4 text-white font-semibold transition 
                ${loading ? "bg-purple-300 cursor-not-allowed" : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"}
              `}
            >
              {loading ? "Envoi en cours..." : "Envoyer le code"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Code reçu"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm transition"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <div></div>
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm transition"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <div></div>
            <button
              onClick={handleResetPassword}
              disabled={loading || !code || !newPassword}
              className={`w-full py-3 rounded-4 text-white font-semibold transition
                ${loading ? "bg-green-300 cursor-not-allowed" : "bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 shadow-lg"}
              `}
            >
              {loading ? "Réinitialisation en cours..." : "Réinitialiser"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
