import { getUserNotifications, markAsRead, markAllAsRead, 
         getUnreadCount, deleteNotification } from "./notifications.service.js";

// Get my notifications
export const myNotifications = async (req, res) => {
  try {
    const notifications = await getUserNotifications(req.user.user_id);
    return res.status(200).json({ success: true, notifications });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get unread count
export const unreadCount = async (req, res) => {
  try {
    const count = await getUnreadCount(req.user.user_id);
    return res.status(200).json({ success: true, count });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Mark one as read
export const readNotification = async (req, res) => {
  try {
    const { notification_id } = req.params;
    const updated = await markAsRead(notification_id, req.user.user_id);

    if (!updated) {
      return res.status(404).json({ error: "Notification not found" });
    }

    return res.status(200).json({ success: true, updated });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Mark all as read
export const readAllNotifications = async (req, res) => {
  try {
    await markAllAsRead(req.user.user_id);
    return res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Delete a notification
export const removeNotification = async (req, res) => {
  try {
    const { notification_id } = req.params;
    const deleted = await deleteNotification(notification_id, req.user.user_id);

    if (!deleted) {
      return res.status(404).json({ error: "Notification not found" });
    }

    return res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};