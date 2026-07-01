import { query } from "../../db/db.js";

// Admin: Sees everything
export const getDashboard = async () => {
  const [
    totalTasksResult,
    pendingTasksResult,
    completedTasksResult,
    overdueTasksResult,
    highPriorityTasksResult,
    tasksPerEmployeeResult
  ] = await Promise.all([
    query(`SELECT COUNT(*) FROM tasks`),
    query(`SELECT COUNT(*) FROM tasks WHERE status = 'pending'`),
    query(`SELECT COUNT(*) FROM tasks WHERE status = 'completed'`),
    query(`SELECT COUNT(*) FROM tasks WHERE due_date < NOW() AND status != 'completed'`),
    query(`SELECT COUNT(*) FROM tasks WHERE priority = 'high'`),
    query(`
      SELECT u.user_id, u.f_name, u.l_name, COUNT(t.task_id) as task_count
      FROM users u
      LEFT JOIN tasks t ON u.user_id = t.assigned_to
      WHERE u.role != 'admin'
      GROUP BY u.user_id, u.f_name, u.l_name
      ORDER BY task_count DESC
    `)
  ]);

  return {
    totalTasks: parseInt(totalTasksResult.rows[0].count),
    pendingTasks: parseInt(pendingTasksResult.rows[0].count),
    completedTasks: parseInt(completedTasksResult.rows[0].count),
    overdueTasks: parseInt(overdueTasksResult.rows[0].count),
    highPriorityTasks: parseInt(highPriorityTasksResult.rows[0].count),
    tasksPerEmployee: tasksPerEmployeeResult.rows.map(row => ({
      user_id: row.user_id,
      name: `${row.f_name} ${row.l_name}`,
      task_count: parseInt(row.task_count)
    }))
  };
};

// Employee: Sees only their own assigned tasks
export const getMyDashboard = async (user_id) => {
  const [
    myTotalResult,
    myPendingResult,
    myCompletedResult,
    myOverdueResult,
    myHighPriorityResult
  ] = await Promise.all([
    query(`SELECT COUNT(*) FROM tasks WHERE assigned_to = $1`, [user_id]),
    query(`SELECT COUNT(*) FROM tasks WHERE assigned_to = $1 AND status = 'pending'`, [user_id]),
    query(`SELECT COUNT(*) FROM tasks WHERE assigned_to = $1 AND status = 'completed'`, [user_id]),
    query(`SELECT COUNT(*) FROM tasks WHERE assigned_to = $1 AND due_date < NOW() AND status != 'completed'`, [user_id]),
    query(`SELECT COUNT(*) FROM tasks WHERE assigned_to = $1 AND priority = 'high'`, [user_id])
  ]);

  return {
    totalTasks: parseInt(myTotalResult.rows[0].count),
    pendingTasks: parseInt(myPendingResult.rows[0].count),
    completedTasks: parseInt(myCompletedResult.rows[0].count),
    overdueTasks: parseInt(myOverdueResult.rows[0].count),
    highPriorityTasks: parseInt(myHighPriorityResult.rows[0].count)
  };
};