import { readFromUsers, writeToUsers } from "./util.js";
import { v4 as generateId } from "uuid";
import bcrypt from "bcryptjs";
import { NotFoundError } from "../util/NotFoundError.js";

export const addUser = async (data) => {
  const storedUsers = await readFromUsers();
  const userId = generateId();

  const hashedPw = await bcrypt.hash(data.password, 12);
  if (!storedUsers.users) {
    storedUsers.users = [];
  }
  storedUsers.users.push({ ...data, password: hashedPw, id: userId });
  await writeToUsers(storedUsers);
  return { id: userId, email: data.email };
};

export const getUser = async (email) => {
  const storedUsers = await readFromUsers();
  if (!storedUsers.users || storedUsers.users.length === 0) {
    throw new NotFoundError("Could not find any users.");
  }

  const user = storedUsers.users.find(
    (storedUser) => storedUser.email === email,
  );
  if (!user) {
    throw new NotFoundError("Could not find user for email " + email);
  }

  return user;
};
