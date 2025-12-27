const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const mealsFilePath = path.join(__dirname, "../meals.json");

function normalizeMeals(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "object" && Array.isArray(raw.meals)) return raw.meals;
  return [];
}

router.get("/", (req, res) => {
  fs.readFile(mealsFilePath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Failed to read meals data" });

    let parsed;
    try {
      parsed = JSON.parse(data || "[]");
    } catch (e) {
      parsed = [];
    }

    const meals = normalizeMeals(parsed);
    res.json(meals);
  });
});

router.post("/", (req, res) => {
  const newMeal = req.body || {};

  fs.readFile(mealsFilePath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Failed to read meals file" });

    let parsed;
    try {
      parsed = JSON.parse(data || "[]");
    } catch (e) {
      parsed = [];
    }

    const meals = normalizeMeals(parsed);

    if (!newMeal.id) newMeal.id = Date.now().toString();
    if (!newMeal.date) newMeal.date = new Date().toISOString().split("T")[0];

    meals.push(newMeal);

    fs.writeFile(mealsFilePath, JSON.stringify(meals, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Failed to save meal" });
      res.json({ message: "Meal added successfully", meal: newMeal });
    });
  });
});

router.delete("/:id", (req, res) => {
  const id = req.params.id;

  fs.readFile(mealsFilePath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Failed to read meals file" });

    let parsed;
    try {
      parsed = JSON.parse(data || "[]");
    } catch (e) {
      parsed = [];
    }

    let meals = normalizeMeals(parsed);
    const before = meals.length;

    meals = meals.filter((m) => String(m.id) !== String(id));

    if (meals.length === before) {
      return res.status(404).json({ error: "Meal not found" });
    }

    fs.writeFile(mealsFilePath, JSON.stringify(meals, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Failed to save meals file" });
      res.json({ message: "Meal deleted" });
    });
  });
});

module.exports = router;
