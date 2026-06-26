import { createProject,getMyProject,hasProjectAccess,getProjectMembers,removeMember,
     getProjectById, isProjectOwener, userExists, addMember, isProjectMember} from "./project.service.js";



// validation 
export const addProject = async (req,res) =>{
try {
    const{ project_name, description}= req.body;

    if (!project_name?.trim()|| !description){
        return res.status(400).json({
            error:"Project and Descreption name are required!"
        });
    }

    const result = await createProject({
        project_name,
        description, 
        created_by: req.user.user_id
    });

    return res.status(201).json(result);

} catch (err) {
  console.log(err);
  
  return res.status(500).json({
    err:err.message,
  });
}
};

// get project
export const myProjects = async (req,res)=>{
    try {
       const projects = await getMyProject(req.user.user_id); 

       return res.status(200).json({
        success: true,
        projects,
       });
    } catch (err) {
        return res.status(500).json({
          err:err.message,
        });
    }
    
}

// get project 
export const getProject = async ( req, res) => {

  try {

    const project_id = req.params.projectId;

    const allowed = await hasProjectAccess( project_id, req.user.user_id);

    if (!allowed) {

      return res.status(403).json({
        error: "Access denied."
      });

    }

    const project = await getProjectById( project_id);

    return res.status(200).json({
      success: true,
      project,
    });

  } catch (error) {

    return res.status(500).json({
      error: error.message,
    });

  }

};

// add member 
export const addProjectMember = async (req, res) => {
    try {
        const project_id = req.params.projectId;

        const { user_id} = req.body;

        const owner = await isProjectOwener(project_id, req.user.user_id);
        if(!owner){
            return res.status(403).json({
                error:"Only owner can add members"
            });
        }

        const exists = await userExists(user_id);

        if(!exists){
            return res.status(404).json({
                error:"User not found"
            });
        }

        // Add member
        const member = await isProjectMember(project_id, user_id);
        if(member){
            return res.status(400).json({
                error:"User already exists in project."
            });
        }

        await addMember(project_id, user_id);

        return res.status(201).json({
            success:true, 
            message:"Member added Successfully.",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error:error.message
        });
    }
};

// get members

export const members = async (req, res)=>{
    try {
        const project_id = req.params.projectId;
        
        const access = await isProjectMember(project_id, req.user.user_id);

        if(!access){
            return res.status(403).json({
                error:"Access denied"
            });
        }

        const result = await getProjectMembers(project_id);
        return res.status(200).json({
            success:true,
            members:result
        });
    } catch (error) {
        return res.status(500).json({
            error:error.message
        });
        
    }
}

// remove Member 
export const deleteMember = async (req, res) => {
  try {
    const project_id = req.params.projectId;
    const user_id = req.params.userId;

    const owner = await isProjectOwener(project_id, req.user.user_id);
    if (!owner) {
      return res.status(403).json({ error: "Only owner can remove members." });
    }

    if (parseInt(user_id) === req.user.user_id) {
      return res.status(400).json({ error: "Owner cannot remove themselves." });
    }

    await removeMember(project_id, user_id);
    return res.status(200).json({ success: true, message: "Member removed successfully." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};