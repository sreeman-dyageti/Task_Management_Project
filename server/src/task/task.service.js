import { query } from "../../db/db.js";

// Create Task
export const createTask = async ({ user_id, title, description, priority, due_date }) => {
  const result = await query(`INSERT INTO tasks (user_id, title, description, priority, due_date)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [user_id, title, description, priority || 'medium', due_date || null]
  );
  return result.rows[0];
};

// update task
export const updateTask = async (task_id, fields) => {
  if (!fields || typeof fields !== 'object') {
    throw new Error("No update fields provided");
  }

  const { title, description, priority, status, due_date } = fields;
  const result = await query( `UPDATE tasks SET title = COALESCE($1, title), description = COALESCE($2, description),
         priority = COALESCE($3, priority),
         status = COALESCE($4, status),
         due_date = COALESCE($5, due_date)
     WHERE task_id = $6
     RETURNING *`,
    [title, description, priority, status, due_date, task_id]
  );

  return result.rows[0];
};

// Get users tasks 
export const getMyTasks = async (user_id) => {
  const result = await query( ` SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC`, [user_id]);
  return result.rows;
};

// Admin to Get all tasks from all users
export const getAllTasks = async () => {
  const result = await query(`SELECT tasks.*, users.f_name, users.l_name, users.email 
    FROM tasks
     JOIN users ON tasks.user_id = users.user_id 
     ORDER BY tasks.created_at DESC`
  );
  return result.rows;
};

// Admin to Delete any task
export const deleteTask = async (task_id) => {
  const result = await query(`DELETE FROM tasks WHERE task_id = $1 RETURNING *`,[task_id]);
  return result.rows[0];
};

// Admin to Get all users
export const getAllUsers = async () => {
  const result = await query(`SELECT user_id, f_name, l_name, email, role, created_at 
     FROM users 
     ORDER BY created_at DESC`
  );
  return result.rows;
};