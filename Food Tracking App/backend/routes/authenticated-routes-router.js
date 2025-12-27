import { Router } from "express";
import {
  addMealItem,
  deleteMealItem,
  replaceMealItem,
  validateMealItem,
} from "../data/meal-item.js";
import { checkAuthMiddleware } from "../util/auth.js";
import {
  addMeal,
  deleteMeal,
  replaceMeal,
  validateMeal,
} from "../data/meal.js";

const authenticatedRoutesRouter = new Router();
authenticatedRoutesRouter.use(checkAuthMiddleware);

authenticatedRoutesRouter.post("/meals", (req, res) => {
  const meal = req.body;
  const errors = validateMeal(meal);

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      message: "Adding the meal failed due to validation errors.",
      errors,
    });
  }

  addMeal(meal)
    .then(() => {
      res.status(201).json({ message: "Meal saved." });
    })
    .catch(() => res.status(500).json({ message: "Meal creation failed." }));
});

authenticatedRoutesRouter.patch("/meals/:id", (req, res) => {
  const meal = req.body;
  const mealId = req.params.id;
  const errors = validateMeal(meal);

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      message: "Adding the meal failed due to validation errors.",
      errors,
    });
  }

  replaceMeal(mealId, meal)
    .then((data) => {
      res.json({ message: "Meal updated.", meal: data });
    })
    .catch((error) =>
      res.status(error.status).json({ message: error.message }),
    );
});

authenticatedRoutesRouter.delete("/meals/:id", (req, res) => {
  const mealId = req.params.id;
  deleteMeal(mealId)
    .then(() => {
      res.json({ message: `Meal with id ${mealId} deleted.` });
    })
    .catch((error) =>
      res.status(error.status).json({ message: error.message }),
    );
});

authenticatedRoutesRouter.post("/meal-items", (req, res) => {
  const mealItem = req.body;
  const errors = validateMealItem(mealItem);

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      message: "Adding the meal item failed due to validation errors.",
      errors,
    });
  }

  addMealItem(mealItem)
    .then(() => {
      res.status(201).json({ message: "Meal item saved." });
    })
    .catch(() => res.status(500).json({ message: "Meal creation failed." }));
});

authenticatedRoutesRouter.patch("/meal-items/:id", (req, res) => {
  const mealItem = req.body;
  const mealItemId = req.params.id;
  const errors = validateMealItem(mealItem);

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      message: "Adding the meal item failed due to validation errors.",
      errors,
    });
  }

  replaceMealItem(mealItemId, mealItem)
    .then((data) => {
      res.json({ message: "Meal item updated.", meal: data });
    })
    .catch((error) =>
      res.status(error.status).json({ message: error.message }),
    );
});

authenticatedRoutesRouter.delete("/meal-items/:id", (req, res) => {
  const mealItemId = req.params.id;
  deleteMealItem(mealItemId)
    .then(() => {
      res.json({ message: `Meal item with id ${mealItemId} deleted.` });
    })
    .catch((error) =>
      res.status(error.status).json({ message: error.message }),
    );
});

export default authenticatedRoutesRouter;
