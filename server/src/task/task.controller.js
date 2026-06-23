import { createTask, getMyTasks, getAllTasks, deleteTask, getAllUsers, updateTask} from "./task.service.js";
import { query } from "../../db/db.js";

// validation 
export const addTask = async (req, res) => {
  try {
    const { title, description, priority, due_date } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    const validPriorities = ["low", "medium", "high"];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ error: "Priority must be low, medium, or high" });
    }

    const task = await createTask({
      user_id: req.user.user_id,
      title,
      description,
      priority,
      due_date,
    });

    return res.status(201).json({ success: true, task });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Employee update own task only
export const editMyTask = async (req, res) => {
  try {
    const { task_id } = req.params;

    // confirm this task belongs to the user
    const check = await query(
      `SELECT * FROM tasks WHERE task_id = $1 AND user_id = $2`,
      [task_id, req.user.user_id]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({ error: "Task not found or not yours" });
    }

    const updated = await updateTask(task_id, req.body);
    return res.status(200).json({ success: true, updated });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


// View My Tasks
export const myTasks = async (req, res) => {
  try {
    const tasks = await getMyTasks(req.user.user_id);

    return res.status(201).json({
      success: true,
      tasks,
    });

  } catch (error) {
    return res.status(500).json({
        
      error: error.message
    });
  }
};

// Admin View all tasks
export const allTasks = async (req, res) => {
  try {
    const tasks = await getAllTasks();
    return res.status(200).json({
       success: true, 
       tasks });
  } catch (error) {
    return res.status(500).json({ 
      error: error.message 
    });
  }
};

// Admin Delete a task
export const removeTask = async (req, res) => {
  try {
    const { task_id } = req.params;
    const deleted = await deleteTask(task_id);

    if (!deleted) {
      return res.status(404).json({
         error: "Task not found"
         });
    }

    return res.status(200).json({ 
      success: true, 
      deleted });
  } catch (error) {
    return res.status(500).json({
       error: error.message 
      });
  }
};

// Admin View all users
export const allUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
// Admin will update any task
export const editAnyTask = async (req, res) => {
  try {
    const { task_id } = req.params;
    const updated = await updateTask(task_id, req.body);

    if (!updated) {
      return res.status(404).json({ error: "Task not found" });
    }

    return res.status(200).json({ success: true, updated });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};