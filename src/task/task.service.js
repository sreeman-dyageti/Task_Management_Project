import { query } from "../../db/db.js";

// Create Task
export const createTask = async ({ user_id, title, description}) => {

  const result = await query(` INSERT INTO tasks (user_id, title, description) VALUES ($1, $2, $3) RETURNING *`,
    [user_id, title, description]
  );

  return result.rows[0];
};

// Get users tasks 
export const getMyTasks = async (user_id) => {
  const result = await query( ` SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC`, [user_id]);
  return result.rows;
};