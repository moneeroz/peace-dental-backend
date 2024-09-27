import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db/drizzle.js";
import { user } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { config } from "dotenv";
config();
// generate an access token
const generateToken = (user) => {
    return jwt.sign(user, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });
};
// generate a refresh token
const generateRefreshToken = (user) => {
    return jwt.sign(user, process.env.JWT_REFRESH);
};
// token
export const genToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(401).json({ message: "Invalid Token" });
    }
    jwt.verify(refreshToken, process.env.JWT_REFRESH, async (err, token_user) => {
        if (err) {
            return res.sendStatus(401);
        }
        // console.log(token_user);
        try {
            const RefreshToken = refreshToken.toString();
            const data = await db
                .select({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                refreshToken: user.refreshToken,
            })
                .from(user)
                .where(eq(token_user.id, user.id));
            if (data[0] && data[0].refreshToken !== refreshToken) {
                return res.status(401).json({ message: "Invalid token" });
            }
            const currentUser = {
                id: data[0].id,
                name: data[0].name,
                email: data[0].email,
                role: data[0].role,
            };
            const token = generateToken(currentUser);
            res.json({ ...currentUser, token, refreshToken });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: "Failed to generate token" });
        }
    });
};
// register a new user
export const newUser = async (req, res) => {
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
        const newUser = {
            id: data[0].id,
            name: data[0].name,
            email: data[0].email,
            role: data[0].role,
        };
        const token = generateToken(newUser);
        const refreshToken = generateRefreshToken(newUser);
        await db.update(user).set({ refreshToken }).where(eq(user.id, newUser.id));
        res.json({ ...data, token });
    }
    catch (error) {
        res.status(500).json({ err: "Failed to create new user", error });
    }
};
// login user
export const loginUser = async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ error: "Failed to login" });
    }
};
// log out
export const logOut = async (req, res) => {
    const { id } = req.params;
    try {
        await db.update(user).set({ refreshToken: "" }).where(eq(user.id, id));
        res.json("Logged out successfully");
    }
    catch (error) {
        res.status(500).json({ error: "Failed to log out" });
    }
};
//# sourceMappingURL=auth.js.map