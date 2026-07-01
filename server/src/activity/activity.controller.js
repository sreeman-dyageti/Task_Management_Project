import { getAllActivity, getProjectActivity, getTaskActivity } from "./activity.service.js";
import { query } from "../../db/db.js";

// Admin — view all activity
export const allActivity = async (req, res) => {
  try {
    const logs = await getAllActivity();
    return res.status(200).json({ success: true, logs });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// View activity for a project
export const projectActivity = async (req, res) => {
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

    const logs = await getProjectActivity(project_id);
    return res.status(200).json({ success: true, logs });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// View activity for a task
export const taskActivity = async (req, res) => {
  try {
    const { task_id } = req.params;

    const logs = await getTaskActivity(task_id);
    return res.status(200).json({ success: true, logs });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};