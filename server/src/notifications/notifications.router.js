import express from "express";
import { myNotifications, unreadCount, readNotification, 
         readAllNotifications, removeNotification } from "./notifications.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authenticate, myNotifications);
router.get("/unread-count", authenticate, unreadCount);
router.patch("/:notification_id/read", authenticate, readNotification);
router.patch("/read-all", authenticate, readAllNotifications);
router.delete("/:notification_id", authenticate, removeNotification);

export default router;