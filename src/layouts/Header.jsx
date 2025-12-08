import React, { useContext, useState, useRef, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Calendar, LogOut, User, Settings, Bell, Zap, Info, HelpCircle } from "lucide-react";

// 🔥 Composant Avatar 100% corrigé (point vert ok partout)
const Avatar = ({ user, size = 50, showOnlineStatus = true }) => {
    const isOnline = user?.isOnline === true;

    return (
        <div style={{ width: size, height: size }} className="relative">
            {user?.profilePicture ? (
                <img
                    src={`http://localhost:8000${user.profilePicture}`}
                    alt={user?.name}
                    style={{ width: size, height: size }}
                    className="rounded-full object-cover border-2 border-white shadow-md"
                />
            ) : (
                <div
                    style={{ width: size, height: size }}
                    className="rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold flex items-center justify-center border-2 border-white shadow-md"
                >
                    {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
                </div>
            )}

            {showOnlineStatus && isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full z-10"></span>
            )}
        </div>
    );
};


const Header = () => {
    const { data } = useContext(AppContext);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // Fermer le menu en cliquant ailleurs
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    if (!user) return null;

    return (
        <header className="w-full absolute top-0 left-0 z-40 px-6 py-4 flex items-center justify-between backdrop-blur-lg shadow-none">

            {/* Logo */}
            <div
    className="flex items-center gap-4 cursor-pointer"
    onClick={() => navigate("/dashboard")}
>
    {/* Logo */}
    <div className="relative p-1 rounded-2xl bg-transparent  flex items-center justify-center">
        {/* Bloc principal */}
        <span className="w-10 h-10 bg-purple-600 rounded-md drop-shadow-lg transform rotate-12"></span>
        {/* Bloc secondaire pour effet dynamique */}
        <span className="w-6 h-6 bg-pink-500 rounded-md absolute top-1 left-1 transform rotate-45 shadow-md shadow-pink-400/40"></span>
    </div>

    {/* Texte */}
    <div className="hidden sm:flex flex-col">
        <span className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight">
            Event<span className="text-purple-600">Planner</span>
        </span>
        <p className="text-sm text-gray-500">Organisez vos événements</p>
    </div>
</div>


            {/* Actions */}
            <div className="flex items-center gap-6">

                {/* Bouton créer événement */}
                <button
                    onClick={() => navigate("/create-event")}
                    className="bg-gradient-to-r rounded-pill from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700
               text-white px-5 py-2.5 font-semibold shadow-lg transition-all hover:shadow-xl hidden md:block"
                >
                    + Créer un événement
                </button>

                {/* Notifications
                <button className="p-2 text-gray-600 hover:text-purple-600 relative rounded-full hover:bg-gray-100 transition-colors">
                    <Bell size={22} />
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                </button> */}

                {/* Avatar + menu */}
                <div className="relative" ref={menuRef}>
                    <div className="relative cursor-pointer" onClick={() => setMenuOpen(!menuOpen)}>
                        <Avatar user={user} size={50} />
                    </div>


                    {menuOpen && (
                        <div className="absolute right-0 mt-3 w-60 bg-gray-100 border border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden">

                            {/* Info utilisateur */}
                            <div className="flex items-center gap-3 p-4 bg-gray-100/80 border-b border-gray-700/30">
                                <Avatar user={user} size={40} />
                                <div className="flex flex-col truncate">
                                    <p className="text-xs text-gray-800">Connecté(e) :</p>
                                    <p className="text-sm font-semibold text-black truncate max-w-[150px]">{user?.name}</p>
                                    <p className="text-xs text-purple-800 truncate max-w-[150px]">{user?.email}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col py-1">
                                <button
                                    onClick={() => { setMenuOpen(false); navigate("/profile"); }}
                                    className="flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-gray-200 transition"
                                >
                                    <User className="w-5 h-5 text-purple-700" /> Mon profil
                                </button>

                                <button
                                    onClick={() => { setMenuOpen(false); navigate("/settings"); }}
                                    className="flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-gray-200 transition"
                                >
                                    <Settings className="w-5 h-5 text-purple-700" /> Paramètres
                                </button>

                                <button
                                    onClick={() => { setMenuOpen(false); navigate("/about"); }}
                                    className="flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-gray-200 transition"
                                >
                                    <Info className="w-5 h-5 text-purple-700" /> À Propos
                                </button>

                                <button
                                    onClick={() => { setMenuOpen(false); navigate("/help"); }}
                                    className="flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-gray-200 transition"
                                >
                                    <HelpCircle className="w-5 h-5 text-purple-700" /> Centre d'Aide
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-800/20 hover:text-red-500 transition border-t border-gray-700 mt-1"
                                >
                                    <LogOut className="w-5 h-5" /> Déconnexion
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
