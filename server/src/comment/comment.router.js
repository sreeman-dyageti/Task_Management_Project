import { createComment, taskComments, removeComment } from "./comment.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import express from "express";

const router = express.Router();

router.post("/tasks/:task_id/comments", authenticate, createComment);
router.get("/tasks/:task_id/comments", authenticate, taskComments);
router.delete("/:comment_id", authenticate, removeComment);

export default router;