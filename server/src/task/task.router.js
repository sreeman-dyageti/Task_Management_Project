import express from "express";
import { addTask, myTasks, allTasks, removeTask, allUsers, editMyTask, editAnyTask, assignedToMe, 
         projectTasks, reassignTaskController} from "./task.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorizeRole } from "../../middleware/role.middleware.js";

const router = express.Router();

// Employee routes
router.post("/create", authenticate, addTask);
router.get("/my-tasks", authenticate, myTasks);
router.get("/assigned-to-me", authenticate, assignedToMe);
router.get("/project/:project_id", authenticate, projectTasks);
// update emp task
router.patch("/:task_id", authenticate, editMyTask); 

// Admin & Owner routes
router.get("/all", authenticate, authorizeRole("admin"), allTasks);
router.delete("/:task_id", authenticate, authorizeRole("admin"), removeTask);
router.get("/users", authenticate, authorizeRole("admin"), allUsers);
// update admin any task
router.patch("/admin/:task_id", authenticate, authorizeRole("admin"), editAnyTask);
// give task to someone else 
router.patch("/:task_id/reassign", authenticate, reassignTaskController);



export default router;