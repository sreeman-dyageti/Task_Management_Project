import express from "express";
import { getAnalytics, getMyAnalytics } from "./dashboard.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorizeRole } from "../../middleware/role.middleware.js";

const router = express.Router();

// Admin route
router.get("/admin-analytics", authenticate, authorizeRole("admin"), getAnalytics);

// Employee route
router.get("/my-analytics", authenticate, getMyAnalytics);

export default router;