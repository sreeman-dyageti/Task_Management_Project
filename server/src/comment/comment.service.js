import { query } from "../../db/db.js";

export const addComment = async ({task_id, user_id, content})=>{
    const result = await query("INSERT INTO comments (task_id, user_id, content) VALUES ($1, $2, $3) RETURNING *", [task_id, user_id, content]);
    return result.rows[0];
}

export const getCommentById = async(comment_id)=>{
    const result = await query("SELECT * FROM comments WHERE comment_id =$1", [comment_id]);
    return result.rows[0];
}

export const deleteComment = async(comment_id)=>{
    const result = await query("DELETE FROM comments WHERE comment_id = $1 RETURNING *",[comment_id]);
    return result.rows[0];
}

export const getAllComments = async (task_id) => {
  const result = await query(
    `SELECT comments.*, 
            users.f_name, users.l_name, users.email
     FROM comments
     JOIN users ON comments.user_id = users.user_id
     WHERE comments.task_id = $1
     ORDER BY comments.created_at ASC`,
    [task_id]
  );
  return result.rows;
};
