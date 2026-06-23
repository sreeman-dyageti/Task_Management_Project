import { createTask, getMyTasks } from "./task.service.js";

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


