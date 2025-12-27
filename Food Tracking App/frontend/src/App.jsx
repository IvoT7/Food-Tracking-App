import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import HomePage from "./components/HomePage";
import MealEntryPage from "./components/MealEntryPage";
import CalendarMeals from "./components/CalendarMeals";
import PrivacyPolicy from "./components/PrivacyPolicy";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(false);
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem("token", userData.token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/home" replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />

        <Route
          path="/home"
          element={
            isAuthenticated ? (
              <HomePage onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/meal-entry"
          element={
            isAuthenticated ? (
              <MealEntryPage />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/calendar"
          element={
            isAuthenticated ? (
              <CalendarMeals />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route path="/privacy" element={<PrivacyPolicy />} />
      </Routes>
    </Router>
  );
}

export default App;
