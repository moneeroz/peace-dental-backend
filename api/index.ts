import express from "express";
import cors from "cors";
import patientRoutes from "./routes/patient.js";
import invoiceRoutes from "./routes/invoice.js";
import doctorRoutes from "./routes/doctor.js";
import appointmentRoutes from "./routes/appointment.js";
import overviewRoutes from "./routes/overview.js";
import revenueRoutes from "./routes/revenue.js";
import authRoutes from "./routes/auth.js";

const app = express();
const port = 3030;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(
  "/api",
  authRoutes,
  patientRoutes,
  invoiceRoutes,
  doctorRoutes,
  appointmentRoutes,
  overviewRoutes,
  revenueRoutes,
);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
