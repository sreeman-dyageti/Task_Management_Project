import { query } from "../../db/db.js";

export const getTaskReportData = async () => {
  const result = await query(` SELECT t.task_id, t.title, t.status, t.priority, t.due_date, p.project_name, 
      creator.f_name || ' ' || creator.l_name AS created_by, 
      assignee.f_name || ' ' || assignee.l_name AS assigned_to 
    FROM tasks t
    LEFT JOIN projects p ON t.project_id = p.project_id
    LEFT JOIN users creator ON t.user_id = creator.user_id
    LEFT JOIN users assignee ON t.assigned_to = assignee.user_id
    ORDER BY t.created_at DESC;
  `);
  
  return result.rows;
};