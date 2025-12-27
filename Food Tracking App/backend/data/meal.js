import { v4 as generateId } from "uuid";
import { readFromMeals, writeToMeals } from "./util.js";
import { NotFoundError } from "../util/NotFoundError.js";
import { isValidDate, isValidText } from "../util/validation.js";

export const getAllMeals = async () => {
  const data = await readFromMeals();
  if (!data.meals) {
    throw new NotFoundError("Could not find any meals.");
  }
  return data.meals;
};

export const getMeal = async (id) => {
  const data = await readFromMeals();
  if (!data.meals || data.meals.length === 0) {
    throw new NotFoundError("Could not find any meals.");
  }

  const meal = data.meals.find((meal) => meal.id === id);
  if (!meal) {
    throw new NotFoundError("Could not find meal for id " + id);
  }

  return meal;
};

export const addMeal = async (meal) => {
  const data = await readFromMeals();
  data.meals.unshift({ id: generateId(), ...meal });
  await writeToMeals(data);
};

export const replaceMeal = async (id, meal) => {
  const data = await readFromMeals();
  if (!data.meals || data.meals.length === 0) {
    throw new NotFoundError("Could not find any meals.");
  }

  const index = data.meals.findIndex((m) => m.id === id);
  if (index < 0) {
    throw new NotFoundError("Could not find meal for id " + id);
  }

  data.meals[index] = { id, ...meal };

  await writeToMeals(data);
};

export const deleteMeal = async (id) => {
  const data = await readFromMeals();
  const meal = data.meals.find((meal) => meal.id === id);

  if (!meal) {
    throw new NotFoundError("Could not find meal for id " + id);
  }

  const updatedData = data.meals.filter((meal) => meal.id !== id);
  await writeToMeals({ ...data, meals: updatedData });
};

export const validateMeal = (meal) => {
  let errors = [];

  if (!isValidText(meal.category)) {
    errors.push("Invalid category.");
  }

  if (!isValidDate(meal.date)) {
    errors.push("Invalid date.");
  }

  if (meal.mealItemList.length === 0) {
    errors.push("Meal Items cannot be empty.");
  }

  return errors;
};
