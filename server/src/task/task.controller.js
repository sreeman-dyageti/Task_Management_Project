import { createTask, getMyTasks, getAllTasks, deleteTask, getAllUsers } from "./task.service.js";

// validation 
export const addTask = async(req, res) =>{
    try {
        const {title, description } = req.body;

        if(!title?.trim()){
            return res.status(400).json({
                error:"title required"
            });
        }

     const task = await createTask({user_id: req.user.user_id,
      title,
      description,
    });

    return res.status(201).json({
      success: true,
      task,
    });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
      error: error.message
    });
  }
}
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
