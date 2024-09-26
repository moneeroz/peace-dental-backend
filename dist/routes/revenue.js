import express from "express";
import { fetchRevenueCardData, fetchYearRevenue, } from "../controllers/revenue.js";
import verifyToken from "../middleware/verifyToken.js";
const router = express.Router();
// Revenue endpoints
router.get("/revenue/year", verifyToken, fetchYearRevenue);
router.get("/revenue/card", verifyToken, fetchRevenueCardData);
export default router;
//# sourceMappingURL=revenue.js.map