import { query } from "../../db/db.js";

// Create Task
export const createTask = async ({ user_id, title, description, priority, due_date, project_id, assigned_to }) => {
  const result = await query(`INSERT INTO tasks (user_id, title, description, priority,due_date, project_id, assigned_to)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [user_id, title, description, priority || 'medium',due_date || null, project_id || null, assigned_to || user_id] );
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

// get tasks assign
export const getAssignedTasks = async (user_id) =>{
  const result = await query(
    `SELECT tasks.*, 
            u.f_name AS assigned_f_name, u.l_name AS assigned_l_name,
            p.project_name
     FROM tasks
     LEFT JOIN users u ON tasks.assigned_to = u.user_id
     LEFT JOIN projects p ON tasks.project_id = p.project_id
     WHERE tasks.assigned_to = $1
     ORDER BY tasks.created_at DESC`,
    [user_id]
  );
  return result.rows;
};

// get all task (project)

export const getProjectTasks = async(project_id) =>{
  const result = await query(`SELECT tasks.*,
            creator.f_name AS creator_f_name, creator.l_name AS creator_l_name,
            assignee.f_name AS assigned_f_name, assignee.l_name AS assigned_l_name,
            p.project_name
     FROM tasks
     LEFT JOIN users creator ON tasks.user_id = creator.user_id
     LEFT JOIN users assignee ON tasks.assigned_to = assignee.user_id
     LEFT JOIN projects p ON tasks.project_id = p.project_id
     WHERE tasks.project_id = $1
     ORDER BY tasks.created_at DESC`,
    [project_id]);
    return result.rows;
};

// ressign a task to another user
export const reassignTask = async (task_id, assigned_to ) =>{
  const result = await query (    `UPDATE tasks SET assigned_to = $1 WHERE task_id = $2 RETURNING *`,
    [assigned_to, task_id]);
    return result.rows[0];
};
