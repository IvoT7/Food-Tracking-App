import React, { useState, useEffect } from "react";
import { Form, Button, Card, Row, Col } from "react-bootstrap";
import { Slide, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./MealEntryPage.css";
import notifySound from "../assets/notify.mp3";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const sound = new Audio(notifySound);

const MealEntryPage = () => {
  const [meals, setMeals] = useState([]);
  const [mealType, setMealType] = useState("breakfast");
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [fat, setFat] = useState("");
  const [carbs, setCarbs] = useState("");
  const [filter, setFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(false);
  const [selectedMeals, setSelectedMeals] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const res = await axios.get("/meals");
        const data = Array.isArray(res.data) ? res.data : [];
        setMeals(data);
      } catch (error) {
        console.error("Error fetching meals:", error);
        toast.error("Failed to fetch meals ❌");
      }
    };
    fetchMeals();
  }, []);

  const playSound = () => {
    sound.currentTime = 0;
    sound.play().catch(() => {});
  };

  const notify = (message, type = "default", icon = "🍽") => {
    playSound();
    toast(message, { icon, type, className: "custom-toast" });
  };

  const addMeal = async (e) => {
    e.preventDefault();

    const newMeal = {
      type: mealType,
      name: name.trim(),
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      fat: Number(fat) || 0,
      carbs: Number(carbs) || 0,
      date: new Date().toISOString().split("T")[0],
    };

    try {
      const res = await axios.post("/meals", newMeal);

      setMeals((prev) => [res.data, ...(Array.isArray(prev) ? prev : [])]);

      setName("");
      setCalories("");
      setProtein("");
      setFat("");
      setCarbs("");

      notify("✅ Meal added successfully!", "success");
    } catch (error) {
      console.error("Error adding meal:", error);
      notify("❌ Failed to add meal.", "error");
    }
  };

  const deleteMeal = async (id) => {
    if (!window.confirm("Are you sure you want to delete this meal?")) return;

    try {
      await axios.delete(`/meals/${id}`);
      setMeals((prev) => (Array.isArray(prev) ? prev.filter((m) => m.id !== id) : []));
      setSelectedMeals((prev) => prev.filter((mealId) => mealId !== id));
      notify("🗑️ Meal deleted!", "error");
    } catch (error) {
      console.error("Error deleting meal:", error);
      notify("⚠️ Failed to delete meal.", "error");
    }
  };

  const editMeal = async (mealToEdit) => {
    const newName = prompt("Edit name:", mealToEdit.name);
    if (!newName) return;

    const newCalories = Number(prompt("Edit calories:", mealToEdit.calories)) || 0;
    const newProtein = Number(prompt("Edit protein (g):", mealToEdit.protein)) || 0;
    const newFat = Number(prompt("Edit fat (g):", mealToEdit.fat)) || 0;
    const newCarbs = Number(prompt("Edit carbs (g):", mealToEdit.carbs)) || 0;

    const updated = {
      ...mealToEdit,
      name: newName,
      calories: newCalories,
      protein: newProtein,
      fat: newFat,
      carbs: newCarbs,
    };

    setMeals((prev) =>
      Array.isArray(prev) ? prev.map((m) => (m.id === mealToEdit.id ? updated : m)) : []
    );

    notify("🛠 Meal updated (local)!", "info");
  };

  const deleteSelectedMeals = async () => {
    if (selectedMeals.length === 0) return alert("No meals selected.");
    if (!window.confirm("Delete all selected meals?")) return;

    try {
      await Promise.all(selectedMeals.map((id) => axios.delete(`/meals/${id}`)));

      setMeals((prev) =>
        Array.isArray(prev) ? prev.filter((m) => !selectedMeals.includes(m.id)) : []
      );
      setSelectedMeals([]);
      notify("🗑️ Selected meals deleted.", "warning");
    } catch (error) {
      console.error("Error deleting selected meals:", error);
      notify("⚠️ Failed to delete selected meals.", "error");
    }
  };

  const filteredMeals =
    filter === "all" ? meals : meals.filter((meal) => meal.type === filter);

  const summary = (Array.isArray(meals) ? meals : []).reduce(
    (acc, meal) => {
      acc.calories += Number(meal.calories || 0);
      acc.protein += Number(meal.protein || 0);
      acc.fat += Number(meal.fat || 0);
      acc.carbs += Number(meal.carbs || 0);
      return acc;
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  );

  const getEmojiForMealType = (type) => {
    switch (type) {
      case "breakfast":
        return "🌅";
      case "lunch":
        return "🍱";
      case "dinner":
        return "🌙";
      case "snack":
        return "🍩";
      default:
        return "🍽️";
    }
  };

  const toggleSelectMeal = (id) => {
    setSelectedMeals((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const exportToCSV = () => {
    const csv = ["Type,Name,Calories,Protein,Fat,Carbs"];
    meals.forEach((meal) => {
      csv.push(`${meal.type},${meal.name},${meal.calories},${meal.protein},${meal.fat},${meal.carbs}`);
    });
    const blob = new Blob([csv.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "meals.csv";
    a.click();
    notify("📤 CSV exported!", "default");
  };

  return (
    <div className={`container ${darkMode ? "dark-mode" : ""}`}>
      <div className="text-end mb-2">
        <Button variant="outline-secondary" size="sm" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </Button>
      </div>

      <div className="text-start mb-3">
        <Button variant="outline-primary" size="sm" onClick={() => navigate("/home")}>
          🏠 Back to Home
        </Button>
      </div>

      <Card className="card">
        <h2 className="meal-title">📝 Add a Meal</h2>
        <Form onSubmit={addMeal}>
          <Form.Select className="mb-2" value={mealType} onChange={(e) => setMealType(e.target.value)}>
            <option value="breakfast">🍳 Breakfast</option>
            <option value="lunch">🥪 Lunch</option>
            <option value="dinner">🍝 Dinner</option>
            <option value="snack">🍪 Snack</option>
          </Form.Select>

          <Form.Control className="mb-2" type="text" placeholder="Meal name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Form.Control className="mb-2" type="number" placeholder="Calories" value={calories} onChange={(e) => setCalories(e.target.value)} required />
          <Form.Control className="mb-2" type="number" placeholder="Protein (g)" value={protein} onChange={(e) => setProtein(e.target.value)} required />
          <Form.Control className="mb-2" type="number" placeholder="Fat (g)" value={fat} onChange={(e) => setFat(e.target.value)} required />
          <Form.Control className="mb-3" type="number" placeholder="Carbs (g)" value={carbs} onChange={(e) => setCarbs(e.target.value)} required />

          <Button type="submit" className="animated-button w-100">
            ➕ Add Meal
          </Button>
        </Form>
      </Card>

      <Card className="card mt-4">
        <h3 className="meal-title">📊 Nutrition Summary</h3>
        <p>Calories: {summary.calories} kcal</p>
        <p>Protein: {summary.protein} g</p>
        <p>Fat: {summary.fat} g</p>
        <p>Carbs: {summary.carbs} g</p>
      </Card>

      <Card className="card mt-4">
        <div className="d-flex justify-content-between align-items-center">
          <h3 className="meal-title">📂 Meals</h3>
          <Button size="sm" variant="outline-success" onClick={exportToCSV}>
            📤 Export CSV
          </Button>
        </div>

        <Form.Select className="mb-3" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Show All</option>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
        </Form.Select>

        <div className="d-flex gap-2 mb-3">
          <Button variant="outline-primary" size="sm" onClick={() => setSelectedMeals(filteredMeals.map((m) => m.id))}>
            ✅ Select All
          </Button>
          <Button variant="outline-warning" size="sm" onClick={() => setSelectedMeals([])}>
            🚫 Deselect All
          </Button>
          <Button variant="outline-danger" size="sm" onClick={deleteSelectedMeals}>
            🗑️ Delete Selected
          </Button>
        </div>

        {filteredMeals.length === 0 ? (
          <p className="text-center text-muted">📋 No meals found. Add your first meal!</p>
        ) : (
          filteredMeals.map((meal) => (
            <Card
              key={meal.id}
              className={`mb-2 p-2 ${selectedMeals.includes(meal.id) ? "selected-meal" : ""}`}
              style={{ cursor: "pointer" }}
              onClick={() => toggleSelectMeal(meal.id)}
            >
              <Row>
                <Col>
                  <strong>
                    {getEmojiForMealType(meal.type)} {meal.name}
                  </strong>{" "}
                  ({meal.type})
                  <br />
                  🥩 Protein: {meal.protein}g | 🧈 Fat: {meal.fat}g | 🍞 Carbs: {meal.carbs}g | 🔥 {meal.calories} kcal
                </Col>
                <Col xs="auto" className="d-flex align-items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      editMeal(meal);
                    }}
                  >
                    🛠 Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMeal(meal.id);
                    }}
                  >
                    ❌ Delete
                  </Button>
                </Col>
              </Row>
            </Card>
          ))
        )}
      </Card>

      <ToastContainer
        position="top-center"
        autoClose={2500}
        transition={Slide}
        newestOnTop
        closeOnClick
        draggable
        pauseOnHover
        theme={darkMode ? "dark" : "light"}
      />
    </div>
  );
};

export default MealEntryPage;
