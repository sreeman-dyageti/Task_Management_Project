import express from "express";
import { addTask, myTasks, allTasks, removeTask, allUsers } from "./task.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorizeRole } from "../../middleware/role.middleware.js";

const router = express.Router();

// Employee routes
router.post("/create", authenticate, addTask);
router.get("/my-tasks", authenticate, myTasks);

// Admin only routes
router.get("/all", authenticate, authorizeRole("admin"), allTasks);
router.delete("/:task_id", authenticate, authorizeRole("admin"), removeTask);
router.get("/users", authenticate, authorizeRole("admin"), allUsers);

export default router;