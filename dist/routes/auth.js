import express from "express";
import { newUser, loginUser, logOut, genToken } from "../controllers/auth.js";
const router = express.Router();
// Auth endpoints
router.post("/auth/register", newUser);
router.post("/auth/login", loginUser);
router.get("/auth/logout/:id", logOut);
router.post("/auth/token", genToken);
export default router;
//# sourceMappingURL=auth.js.map