import express from "express";

import { addTask,myTasks} from "./task.controller.js";

import { authenticate } from "../../middleware/auth.middleware.js";

const router = express.Router();


router.post( "/create", authenticate,addTask);


router.get("/my-tasks",authenticate, myTasks);
export default router;