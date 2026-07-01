import express from "express";
import { exportTasksCSV, exportTasksPDF } from "./report.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorizeRole } from "../../middleware/role.middleware.js";

const router = express.Router();

// Admins only
router.get("/tasks/csv", authenticate, authorizeRole("admin"), exportTasksCSV);
router.get("/tasks/pdf", authenticate, authorizeRole("admin"), exportTasksPDF);

export default router;