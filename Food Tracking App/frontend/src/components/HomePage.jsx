import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./HomePage.css";

const API_BASE = "http://localhost:5000";

function HomePage({ onLogout }) {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getYesterdayKey = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  };

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const res = await axios.get(`${API_BASE}/meals`);
        const allMeals = Array.isArray(res.data) ? res.data : [];

        const yesterdayKey = getYesterdayKey();
        const yMeals = allMeals.filter((m) => {
          const date = (m.date || "").split("T")[0];
          return date === yesterdayKey;
        });

        setMeals(yMeals.reverse());
      } catch (error) {
        console.error("Error fetching meals:", error);
        setMeals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  const handleLogout = () => {
    onLogout?.();
    navigate("/", { replace: true });
  };

  return (
    <div className="home-container">
      <header className="home-header shadow-sm d-flex justify-content-between align-items-center p-3">
        <h1 className="app-title m-0">🍎 Food Tracker Dashboard</h1>
        <button className="btn btn-outline-danger logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </header>

      <div className="container mt-4 fade-in">
        <h2 className="text-center mb-4">🥗 Yesterday's Meals</h2>

        <div className="card meal-card shadow-sm p-3">
          {loading ? (
            <p className="text-center text-muted m-0">Loading...</p>
          ) : meals.length > 0 ? (
            <ul className="list-group list-group-flush">
              {meals.map((meal, index) => (
                <li
                  key={meal.id || index}
                  className="list-group-item meal-item d-flex justify-content-between align-items-center"
                >
                  <span className="meal-name">{meal.name}</span>
                  <span className="meal-calories text-muted">{meal.calories} kcal</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-muted m-0">
              No meals entered yet. Go to the tracker and add your meals.
            </p>
          )}
        </div>

        <div className="d-flex justify-content-center gap-3 mt-4">
          <button className="btn btn-success px-4" onClick={() => navigate("/meal-entry")}>
            ➕ Add Meal
          </button>

          <button className="btn btn-primary px-4" onClick={() => navigate("/calendar")}>
            🗓 View Calendar
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
