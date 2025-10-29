// App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import Home from "./pages/Home";
import Layout from "./layouts/Layout";
import Dashboard from "./pages/Dashboard";
import CreateEvent from "./pages/CreateEvent";
import EventDetails from "./pages/EventDetails";

// Séparer les routes pour accéder au context
function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Pages publiques */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Signup />} />

      {/* Pages privées */}
      <Route path="/dashboard" element={isAuthenticated ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />} />
      <Route path="/create-event" element={isAuthenticated ? <Layout><CreateEvent /></Layout> : <Navigate to="/login" />} />
      <Route path="/event/:id" element={isAuthenticated ? <Layout><EventDetails /></Layout> : <Navigate to="/login" />} />

      {/* Redirection par défaut */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

// AuthProvider englobe tout
export default function App() {
  return (
   
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    
  );
}
