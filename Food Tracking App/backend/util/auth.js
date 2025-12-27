import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NotAuthError } from "./NotFoundError.js";

const KEY = "SecretTokenKeyHardcodedInBackend";

export const createJSONToken = (email) => {
  return jwt.sign({ email }, KEY, { expiresIn: "1h" });
};

export const validateJSONToken = (token) => {
  return jwt.verify(token, KEY);
};

export const isValidPassword = (password, storedPassword) => {
  return bcrypt.compare(password, storedPassword);
};

export const checkAuthMiddleware = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  if (!req.headers.authorization) {
    console.log("AUTHENTICATION FAILED. AUTHORIZATION HEADER MISSING.");
    return next(new NotAuthError("Not authenticated."));
  }
  const authFragments = req.headers.authorization.split(" ");

  if (authFragments.length !== 2) {
    console.log("AUTHENTICATION FAILED. AUTHORIZATION HEADER INVALID.");
    return next(new NotAuthError("Not authenticated."));
  }
  const authToken = authFragments[1];
  try {
    req.token = validateJSONToken(authToken);
  } catch (error) {
    console.log("AUTHENTICATION FAILED. TOKEN INVALID.");
    return next(new NotAuthError("Not authenticated."));
  }
  next();
};
