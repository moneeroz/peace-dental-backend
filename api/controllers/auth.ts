import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db/drizzle.js";
import { user } from "../db/schema.js";
import { eq } from "drizzle-orm";

require("dotenv").config();

type dbUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};
// generate an access token
const generateToken = (user: dbUser) => {
  return jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// generate a refresh token
const generateRefreshToken = (user: dbUser) => {
  return jwt.sign(user, process.env.JWT_REFRESH);
};

// token
export const genToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Invalid Token" });
  }

  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH,
    async (err: any, token_user: any) => {
      if (err) {
        return res.sendStatus(403);
      }

      const data = await db
        .select()
        .from(user)
        .where(eq(refreshToken, user.refreshToken));

      if (!data) {
        return res.status(403).json({ message: "Invalid token" });
      }

      const currentUser = {
        id: data[0].id,
        name: data[0].name,
        email: data[0].email,
        role: data[0].role,
      };

      const token = generateToken(currentUser);
      res.json({ ...currentUser, token, refreshToken });
    },
  );
};

// register a new user
export const newUser = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    const data = await db.insert(user).values({
      name,
      email,
      password: hashedPassword,
      refreshToken: "",
    });

    const newUser: dbUser = {
      id: data[0].id,
      name: data[0].name,
      email: data[0].email,
      role: data[0].role,
    };

    const token = generateToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    await db.update(user).set({ refreshToken }).where(eq(user.id, newUser.id));

    res.json({ ...data, token });
  } catch (error) {
    res.status(500).json({ err: "Failed to create new user", error });
  }
};

// login user
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const data = await db.select().from(user).where(eq(user.email, email));

    if (!data) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const match = await bcrypt.compare(password, data[0].password);

    if (!match) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const dbUser = {
      id: data[0].id,
      name: data[0].name,
      email: data[0].email,
      role: data[0].role,
    };

    const token = generateToken(dbUser);
    const refreshToken = generateRefreshToken(dbUser);

    await db.update(user).set({ refreshToken }).where(eq(user.id, dbUser.id));

    res.json({ ...dbUser, token, refreshToken });
  } catch (error) {
    res.status(500).json({ error: "Failed to login" });
  }
};

// log out
export const logOut = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await db.update(user).set({ refreshToken: "" }).where(eq(user.id, id));
    res.json("Logged out successfully");
  } catch (error) {
    res.status(500).json({ error: "Failed to log out" });
  }
};
