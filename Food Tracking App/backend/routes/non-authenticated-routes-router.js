import { Router } from "express";
import { getAllMeals, getMeal } from "../data/meal.js";
import { getAllMealItems, getMealItem } from "../data/meal-item.js";

const nonAuthenticatedRoutesRouter = new Router();
nonAuthenticatedRoutesRouter.get("/meals", (req, res) => {
  getAllMeals()
    .then((data) => {
      res.json(data);
    })
    .catch((error) =>
      res.status(error.status).json({ message: error.message }),
    );
});

nonAuthenticatedRoutesRouter.get("/meals/:id", (req, res) => {
  const mealId = req.params.id;
  getMeal(mealId)
    .then((data) => {
      res.json(data);
    })
    .catch((error) =>
      res.status(error.status).json({ message: error.message }),
    );
});

nonAuthenticatedRoutesRouter.get("/meal-items", (req, res) => {
  getAllMealItems()
    .then((data) => {
      res.json(data);
    })
    .catch((error) =>
      res.status(error.status).json({ message: error.message }),
    );
});

nonAuthenticatedRoutesRouter.get("/meal-items/:id", (req, res) => {
  const mealItemId = req.params.id;
  getMealItem(mealItemId)
    .then((data) => {
      res.json(data);
    })
    .catch((error) =>
      res.status(error.status).json({ message: error.message }),
    );
});

export default nonAuthenticatedRoutesRouter;
