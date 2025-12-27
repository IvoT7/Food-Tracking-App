import fs from "fs/promises";

export const readFromMeals = async () => {
  const data = await fs.readFile("meals.json", "utf8");
  return JSON.parse(data);
};

export const writeToMeals = async (data) => {
  await fs.writeFile("meals.json", JSON.stringify(data));
};

export const readFromMealItems = async () => {
  const data = await fs.readFile("meal-items.json", "utf8");
  return JSON.parse(data);
};

export const writeToMealItems = async (data) => {
  await fs.writeFile("meal-items.json", JSON.stringify(data));
};

export const readFromUsers = async () => {
  const data = await fs.readFile("users.json", "utf8");
  return JSON.parse(data);
};

export const writeToUsers = async (data) => {
  await fs.writeFile("users.json", JSON.stringify(data));
};
