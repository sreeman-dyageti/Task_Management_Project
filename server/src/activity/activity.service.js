import { query } from "../../db/db.js";

// Log an activity
export const logActivity = async ({ user_id, event_type, description, project_id = null, task_id = null }) => {
  await query(
    `INSERT INTO activity_logs (user_id, event_type, description, project_id, task_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [user_id, event_type, description, project_id, task_id]
  );
};

// Get all activity (admin)
export const getAllActivity = async () => {
  const result = await query(`SELECT activity_logs.*,users.f_name, users.l_name
     FROM activity_logs
     LEFT JOIN users ON activity_logs.user_id = users.user_id
     ORDER BY activity_logs.created_at DESC`
  );
  return result.rows;
};

// Get activity of a project
export const getProjectActivity = async (project_id) => {
  const result = await query( `SELECT activity_logs.*,users.f_name, users.l_name
     FROM activity_logs
     LEFT JOIN users ON activity_logs.user_id = users.user_id
     WHERE activity_logs.project_id = $1
     ORDER BY activity_logs.created_at DESC`,
    [project_id]
  );
  return result.rows;
};

// Get activity for a specific task
export const getTaskActivity = async (task_id) => {
  const result = await query(`SELECT activity_logs.*, users.f_name, users.l_name
     FROM activity_logs
     LEFT JOIN users ON activity_logs.user_id = users.user_id
     WHERE activity_logs.task_id = $1
     ORDER BY activity_logs.created_at DESC`,
    [task_id]
  );
  return result.rows;
};