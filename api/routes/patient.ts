import express from "express";
import {
  filteredPatients,
  fetchPatientsPages,
  fetchPatient,
  newPatient,
  updatePatient,
  deletePatient,
  allPatients,
} from "../controllers/patient.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// patient endpoints
router.post("/patients", verifyToken, newPatient);
router.get("/patients", filteredPatients);
router.get("/patients/all", allPatients);
router.get("/patients/:id", fetchPatient);
router.get("/patients/pages/count", fetchPatientsPages);
router.put("/patients/:id", verifyToken, updatePatient);
router.delete("/patients/:id", verifyToken, deletePatient);

export default router;
