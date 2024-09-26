import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { newAppointment, updateAppointment, filteredAppointments, getAppointment, fetchAppointmentsPages, deleteAppointment, } from "../controllers/appointment.js";
const router = express.Router();
// appointmet endpoints
router.post("/appointments", verifyToken, newAppointment);
router.get("/appointments", filteredAppointments);
router.get("/appointments/:id", getAppointment);
router.get("/appointments/pages/count", fetchAppointmentsPages);
router.put("/appointments/:id", verifyToken, updateAppointment);
router.delete("/appointments/:id", verifyToken, deleteAppointment);
export default router;
//# sourceMappingURL=appointment.js.map