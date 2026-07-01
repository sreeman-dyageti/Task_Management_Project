import cron from "node-cron";
import { query } from "../../db/db.js";
import { createNotification } from "./notifications.service.js";

export const startNotificationCron = () => {

  // runs every day at 8am
  cron.schedule("0 8 * * *", async () => {
    console.log("Running due date notification check...");

    try {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // tasks due within 24 hours
      const dueSoon = await query(
        `SELECT tasks.*, users.f_name FROM tasks
         JOIN users ON tasks.assigned_to = users.user_id
         WHERE tasks.due_date BETWEEN $1 AND $2
         AND tasks.status != 'completed'`,
        [now.toISOString(), tomorrow.toISOString()]
      );

      for (const task of dueSoon.rows) {
        await createNotification({
          user_id: task.assigned_to,
          message: `Task "${task.title}" is due soon — due on ${new Date(task.due_date).toLocaleDateString()}`,
        });
      }

      // overdue tasks
      const overdue = await query(
        `SELECT tasks.*, users.f_name FROM tasks
         JOIN users ON tasks.assigned_to = users.user_id
         WHERE tasks.due_date < $1
         AND tasks.status != 'completed'`,
        [now.toISOString()]
      );

      for (const task of overdue.rows) {
        await createNotification({
          user_id: task.assigned_to,
          message: `Task "${task.title}" is overdue — was due on ${new Date(task.due_date).toLocaleDateString()}`,
        });
      }

      console.log(`Notified ${dueSoon.rows.length} due soon, ${overdue.rows.length} overdue tasks`);
    } catch (error) {
      console.error("Cron job error:", error.message);
    }
  });
};