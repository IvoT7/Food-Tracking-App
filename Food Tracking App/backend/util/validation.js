export const isValidText = (value, minLength = 1) => {
  return value && value.trim().length >= minLength;
};

export const isValidDate = (value) => {
  const date = new Date(value);
  return value && date !== "Invalid Date";
};

export const isValidImageUrl = (value) => {
  return value && value.startsWith("http");
};

export const isValidEmail = (value) => {
  return value && value.includes("@");
};
