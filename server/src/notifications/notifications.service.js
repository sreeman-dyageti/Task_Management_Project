import { query } from "../../db/db.js";

// Create a notification
export const createNotification = async ({ user_id, message }) => {
  await query(
    `INSERT INTO notifications (user_id, message)
     VALUES ($1, $2)`,
    [user_id, message]
  );
};

// Get all notifications for a user
export const getUserNotifications = async (user_id) => {
  const result = await query(
    `SELECT * FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [user_id]
  );
  return result.rows;
};

// Mark a notification as read
export const markAsRead = async (notification_id, user_id) => {
  const result = await query(
    `UPDATE notifications 
     SET is_read = TRUE 
     WHERE notification_id = $1 AND user_id = $2
     RETURNING *`,
    [notification_id, user_id]
  );
  return result.rows[0];
};

// Mark all notifications as read
export const markAllAsRead = async (user_id) => {
  await query(
    `UPDATE notifications SET is_read = TRUE WHERE user_id = $1`,
    [user_id]
  );
};

// Get unread count
export const getUnreadCount = async (user_id) => {
  const result = await query(
    `SELECT COUNT(*) FROM notifications 
     WHERE user_id = $1 AND is_read = FALSE`,
    [user_id]
  );
  return parseInt(result.rows[0].count);
};

// Delete a notification
export const deleteNotification = async (notification_id, user_id) => {
  const result = await query(
    `DELETE FROM notifications 
     WHERE notification_id = $1 AND user_id = $2 
     RETURNING *`,
    [notification_id, user_id]
  );
  return result.rows[0];
};
