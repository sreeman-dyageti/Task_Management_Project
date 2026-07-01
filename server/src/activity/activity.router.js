import express from "express";
import { allActivity, projectActivity, taskActivity } from "./activity.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorizeRole } from "../../middleware/role.middleware.js";

const router = express.Router();

router.get("/all", authenticate, authorizeRole("admin"), allActivity);
router.get("/project/:project_id", authenticate, projectActivity);
router.get("/task/:task_id", authenticate, taskActivity);

export default router;