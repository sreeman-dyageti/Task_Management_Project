import { query } from "../../db/db.js";
import { addComment, getAllComments, deleteComment, getCommentById } from "./comment.service.js";
import { logActivity } from "../activity/activity.service.js";

// Add comment to a task
export const createComment = async (req,res)=>{
    try {
    const {task_id} = req.params;
    const {content} = req.body;

    if(!content?.trim()){
        return res.status(400).json({error:"Comment content is required"});
    }

    // verify task existss
    const taskCheck = await query(
        `SELECT * FROM tasks WHERE task_id = $1`,[task_id]
    );
    if(taskCheck.rows.length === 0){
        return res.status(404).json({error: "Task not found"});
    }

    // verify user has access to the task's project
    const task = taskCheck.rows[0];
    if(task.project_id){
        const memberCheck = await query(
            `SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2`, [task.project_id, req.user.user_id]
        );
        if (memberCheck.rows.length === 0 ){
            return res.status(403).json({error:"Access denied"});
        }
    }

    const comment = await addComment({
        task_id, user_id:req.user.user_id,
        content: content.trim()
    });

    await logActivity({
        user_id: req.user.user_id,
        event_type: "COMMENT_ADDED",
        description: `Comment added to task ${task_id}`,
        task_id: parseInt(task_id),
        project_id: task.project_id,
    });        
    return res.status(201).json({success: true, comment});
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: error.message});    
    } 
}

// get all Comments for the task 
export const taskComments = async (req, res)=>{
    try {
        const {task_id} = req.params;

        const taskCheck = await query (`SELECT * from tasks WHERE task_id = $1`,[task_id]);
        if(taskCheck.rows.length === 0){
        return res.status(404).json({error: "Task not found"});
        }

        const comments = await getAllComments(task_id);
        return res.status(200).json({success:true, comments});

    } catch (error) {
        console.log(error);
        return res.status(500).json({error: error.message});
    }
}

// delete Comment

export const removeComment = async (req, res)=>{
    try {
        const {comment_id} = req.params;

        const comment = await getCommentById(comment_id);
        if(!comment){
            return res.status(404).json({error:"Comment not found"});
        }

        // only comment owner or admin can delete
        const isOwner = comment.user_id === req.user.user_id;
        const isAdmin = req.user.role === 'admin';

        if(!isOwner && !isAdmin){
            return res.status(403).json({error: "Not authorized to delete this comment!"});
        }

        await deleteComment(comment_id);
        return res.status(200).json({success:true, message:"Comment deleted"});
    } catch (error) {
        console.log(error)
        return res.status(500).json({error: error.message});
    }
}