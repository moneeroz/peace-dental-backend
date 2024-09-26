import express from "express";
import { filteredInvoices, fetchInvoice, updateInvoice, fetchPatientInvoices, fetchInvoicesPages, deleteInvoice, newInvoice, } from "../controllers/invoice.js";
import verifyToken from "../middleware/verifyToken.js";
const router = express.Router();
router.post("/invoices", verifyToken, newInvoice);
router.get("/invoices", filteredInvoices);
router.get("/invoices/:id", fetchInvoice);
router.get("/patients/invoices/:id", fetchPatientInvoices);
router.get("/invoices/pages/count", fetchInvoicesPages);
router.put("/invoices/:id", verifyToken, updateInvoice);
router.delete("/invoices/:id", verifyToken, deleteInvoice);
export default router;
//# sourceMappingURL=invoice.js.map