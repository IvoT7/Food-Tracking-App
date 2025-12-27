import { v4 as generateId } from "uuid";
import { readFromMealItems, writeToMealItems } from "./util.js";
import { NotFoundError } from "../util/NotFoundError.js";
import { isValidDate, isValidText } from "../util/validation.js";

export const getAllMealItems = async () => {
  const data = await readFromMealItems();
  if (!data.mealItems) {
    throw new NotFoundError("Could not find any meal items.");
  }
  return data.mealItems;
};

export const getMealItem = async (id) => {
  const data = await readFromMealItems();
  if (!data.mealItems || data.mealItems.length === 0) {
    throw new NotFoundError("Could not find any meal items.");
  }

  const mealItem = data.mealItems.find((mealItem) => mealItem.id === id);
  if (!mealItem) {
    throw new NotFoundError("Could not find meal item for id " + id);
  }

  return mealItem;
};

export const addMealItem = async (mealItem) => {
  const data = await readFromMealItems();
  data.mealItems.unshift({ id: generateId(), ...mealItem });
  await writeToMealItems(data);
};

export const replaceMealItem = async (id, mealItem) => {
  const data = await readFromMealItems();
  if (!data.mealItems || data.mealItems.length === 0) {
    throw new NotFoundError("Could not find any meal items.");
  }

  const index = data.mealItems.findIndex((m) => m.id === id);
  if (index < 0) {
    throw new NotFoundError("Could not find meal item for id " + id);
  }

  data.mealItems[index] = { id, ...mealItem };

  await writeToMealItems(data);
};

export const deleteMealItem = async (id) => {
  const data = await readFromMealItems();
  const mealItem = data.mealItems.find((mealItem) => mealItem.id === id);

  if (!mealItem) {
    throw new NotFoundError("Could not find meal item for id " + id);
  }

  const updatedData = data.mealItems.filter((meal) => meal.id !== id);
  await writeToMealItems({ ...data, mealItems: updatedData });
};

export const validateMealItem = (mealItem) => {
  let errors = [];

  if (!isValidText(mealItem.name)) {
    errors.push("Invalid name.");
  }

  if (mealItem.amount <= 0) {
    errors.push("Invalid amount.");
  }

  if (mealItem.carbohydrate <= 0) {
    errors.push("Invalid carbohydrates.");
  }

  if (mealItem.protein <= 0) {
    errors.push("Invalid protein.");
  }

  if (mealItem.fat <= 0) {
    errors.push("Invalid fat.");
  }

  if (mealItem.calories <= 0) {
    errors.push("Invalid calories.");
  }

  return errors;
};
