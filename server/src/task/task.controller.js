import { createTask, getMyTasks, getAllTasks, deleteTask, 
         getAllUsers, updateTask, getAssignedTasks, 
         getProjectTasks, reassignTask } from "./task.service.js";
import { logActivity } from "../activity/activity.service.js";
import { query } from "../../db/db.js";

// validation 
export const addTask = async (req, res) => {
  try {
    const { title, description, priority, status,due_date, project_id, assigned_to } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    const validStatuses = ["pending", "in-progress", "completed"];
    if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
    }

    const validPriorities = ["low", "medium", "high"];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ error: "Priority must be low, medium, or high" });
    }

    if (due_date && isNaN(Date.parse(due_date))) {
    return res.status(400).json({ error: "Invalid due date" });
  }

  // if project_id given, verify user is a member
  if(project_id){
    const memberCheck = await query(
      `SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2`,
      [project_id, req.user.user_id]
    );
    if (memberCheck.rows.length === 0 ){
      return res.status(403).json({error:"Assigned user is not a member of this project"});
    }
  }
    const task = await createTask({
      user_id: req.user.user_id,
      title,
      description,
      priority,
      due_date, project_id, assigned_to,
    });
    await logActivity({
    user_id: req.user.user_id,
    event_type: "TASK_CREATED",
    description: `Task "${task.title}" was created`,
    project_id: task.project_id,
    task_id: task.task_id,
  });
// notify assigned user if different from creator
if (task.assigned_to && task.assigned_to !== req.user.user_id) {
  await createNotification({
    user_id: task.assigned_to,
    message: `You have been assigned a new task: "${task.title}"`,
  });
}
    return res.status(201).json({ success: true, task });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

// Employee update own task only
export const editMyTask = async (req, res) => {
  try {
    const { task_id } = req.params;
    const { title, description, priority, status, due_date } = req.body;

    // confirm this task belongs to the user
    const check = await query(
      `SELECT * FROM tasks WHERE task_id = $1 AND user_id = $2`,
      [task_id, req.user.user_id]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({ error: "Task not found or not yours" });
    }

    const validStatuses = ["pending", "in-progress", "completed"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    if (due_date && isNaN(Date.parse(due_date))) {
      return res.status(400).json({ error: "Invalid due date" });
    }

    const updated = await updateTask(task_id, req.body);
    if (req.body.status) {
    await logActivity({
      user_id: req.user.user_id,
      event_type: "TASK_STATUS_UPDATED",
      description: `Task "${updated.title}" status changed to "${updated.status}"`,
      project_id: updated.project_id,
      task_id: updated.task_id,
    });
  }
    return res.status(200).json({ success: true, updated });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

// View My Tasks
export const myTasks = async (req, res) => {
  try {
    const tasks = await getMyTasks(req.user.user_id);

    return res.status(200).json({
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
    const { title, description, priority, status, due_date } = req.body; 

    const validStatuses = ["pending", "in-progress", "completed"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    if (due_date && isNaN(Date.parse(due_date))) {
      return res.status(400).json({ error: "Invalid due date" });
    }

    const updated = await updateTask(task_id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (req.body.status) {
      await logActivity({
        user_id: req.user.user_id,
        event_type: "TASK_STATUS_UPDATED",
        description: `Task "${updated.title}" status changed to "${updated.status}"`,
        project_id: updated.project_id,
        task_id: updated.task_id,
      });
      if (updated.assigned_to && updated.assigned_to !== req.user.user_id) {
      await createNotification({
        user_id: updated.assigned_to,
        message: `Task "${updated.title}" status was updated to "${updated.status}"`,
      });
    }    
  }

    return res.status(200).json({ success: true, updated });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get tasks assigned to me
export const assignedToMe = async (req, res) => {
  try {
    const tasks = await getAssignedTasks(req.user.user_id);
    return res.status(200).json({ success: true, tasks });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get all tasks under a project
export const projectTasks = async (req, res) => {
  try {
    const { project_id } = req.params;

    // verify user is a project member
    const memberCheck = await query(
      `SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2`,
      [project_id, req.user.user_id]
    );
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: "Access denied" });
    }

    const tasks = await getProjectTasks(project_id);
    return res.status(200).json({ success: true, tasks });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Reassign a task (admin only)
export const reassignTaskController = async (req, res) => {
  try {
    const { task_id } = req.params;
    const { assigned_to } = req.body;

    if (!assigned_to) {
      return res.status(400).json({ error: "assigned_to is required" });
    }

    // get the task first
    const taskResult = await query(
      `SELECT * FROM tasks WHERE task_id = $1`, [task_id]
    );
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    const task = taskResult.rows[0];

    // only task creator, project owner, or admin can reassign
    const isAdmin = req.user.role === 'admin';
    const isCreator = task.user_id === req.user.user_id;

    let isProjectOwner = false;
    if (task.project_id) {
      const ownerCheck = await query(
        `SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2 AND role = 'owner'`,
        [task.project_id, req.user.user_id]
      );
      isProjectOwner = ownerCheck.rows.length > 0;
    }

    if (!isAdmin && !isCreator && !isProjectOwner) {
      return res.status(403).json({ error: "Not authorized to reassign this task" });
    }

    // verify new assignee is a project member
    if (task.project_id) {
      const assigneeCheck = await query(
        `SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2`,
        [task.project_id, assigned_to]
      );
      if (assigneeCheck.rows.length === 0) {
        return res.status(400).json({ error: "Assigned user is not a project member" });
      }
    }

    const updated = await reassignTask(task_id, assigned_to);

    await logActivity({
    user_id: req.user.user_id,
    event_type: "TASK_ASSIGNED",
    description: `Task "${updated.title}" was reassigned to user ${assigned_to}`,
    project_id: updated.project_id,
    task_id: updated.task_id,
  });
  await createNotification({
  user_id: assigned_to,
  message: `You have been assigned the task: "${updated.title}"`,
  });
    return res.status(200).json({ success: true, updated });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};