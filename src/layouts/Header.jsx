import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { data } = useContext(AppContext);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header
      style={{
        gridColumn: "1 / -1",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 2rem",
        backgroundColor: "white",
        borderBottom: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        height: "80px",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: "700",
            color: "#7c3aed",
            margin: 0,
            cursor: "pointer",
          }}
          onClick={() => navigate("/dashboard")}
        >
          📊 EventPlanner
        </h1>
      </div>

      {/* Zone droite */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {/* Bouton créer événement */}
        <button
          onClick={() => navigate("/create-event")}
          style={{
            backgroundColor: "#ff5a3d",
            color: "white",
            padding: "0.65rem 1.5rem",
            border: "none",
            borderRadius: "24px",
            fontSize: "0.95rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: "0 2px 8px rgba(255,90,61,0.3)",
          }}
        >
          + Créer un événement
        </button>

        {/* Profil utilisateur */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              backgroundColor: "#7c3aed",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "600",
              fontSize: "0.9rem",
              textTransform: "uppercase",
            }}
          >
            {data.user.charAt(0)}
          </div>
          <span style={{ fontWeight: "500", color: "#374151" }}>
            {data.user}
          </span>

          {/* Bouton Déconnexion */}
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "transparent",
              color: "#6b7280",
              padding: "0.5rem 1rem",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
