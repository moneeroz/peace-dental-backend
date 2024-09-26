import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { newDoctor, getDoctors, getDoctor, updateDoctor, deleteDoctor, } from "../controllers/doctor.js";
const router = express.Router();
// doctor endpoints
router.post("/doctors", verifyToken, newDoctor);
router.get("/doctors", getDoctors);
router.get("/doctors/:id", getDoctor);
router.put("/doctors/:id", verifyToken, updateDoctor);
router.delete("/doctors/:id", verifyToken, deleteDoctor);
export default router;
//# sourceMappingURL=doctor.js.map