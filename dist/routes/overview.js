import express from "express";
import { getLatestAppointments, getLatestInvoices, fetchCardData, fetchAppointments, updateAppointment, } from "../controllers/overview.js";
const router = express.Router();
// Overview endpoints
router.get("/overview/latest-appointments", getLatestAppointments);
router.get("/overview/latest-invoices", getLatestInvoices);
router.get("/overview/card-data", fetchCardData);
router.get("/overview/calender", fetchAppointments);
router.put("/overview/update-appointment/:id", updateAppointment);
export default router;
//# sourceMappingURL=overview.js.map