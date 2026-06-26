import {query} from '../../db/db.js';

// create Project
export const createProject = async({ project_name,
    description,
    created_by,
}) => {
    const projectResult = await query(`INSERT INTO projects(project_name, description, created_by) VALUES ($1, $2, $3) RETURNING *`,[project_name, description, created_by]);

    const project = projectResult.rows[0];

    // assign creater as owner
    await query (`INSERT INTO project_members(project_id, user_id, role)
        VALUES($1, $2, 'owner')`,[project.project_id, created_by]);
        return{
            success:true,
            project,
        };
};

// get my project
export const getMyProject = async (user_id)=>{
    const result = await query(` SELECT p.project_id, p.project_name, p.description, p.created_at,
      pm.role
    FROM projects p
    INNER JOIN project_members pm
      ON p.project_id = pm.project_id
    WHERE pm.user_id = $1
    ORDER BY p.created_at DESC`,[user_id]);

    return result.rows;
};

// Check Project Access

export const hasProjectAccess = async ( project_id, user_id) => {

  const result = await query(`SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2`,
    [project_id, user_id]
  );

  return result.rows.length > 0;

};

// get project by id 
export const getProjectById = async ( project_id) => {

  const result = await query(` SELECT * FROM projects WHERE project_id = $1`,[project_id]);

  return result.rows[0];
};
// check
export const isProjectOwener = async (project_id, user_id) =>{
    const result = await query(`SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2 AND role = 'owner'`,[project_id, user_id]);

    return result.rows.length > 0;
};
// check projectMember
export const isProjectMember = async (project_id, user_id)=>{
    const result = await query(`SELECT * FROM project_members WHERE project_id =$1 AND user_id = $2`,[project_id, user_id]);
    return result.rows.length > 0;
}
// check 
export const userExists = async (user_id) => {
    const result = await query ( `SELECT user_id FROM users WHERE user_id = $1`,[user_id]
    );

    return result.rows.length >0;
};

// add members
export const addMember = async (project_id, user_id) => {
    const result = await query(`INSERT INTO project_members(project_id, user_id, role) VALUES($1, $2, 'member') RETURNING *`,[project_id, user_id]);
    return result.rows[0];
};
 
// get members 
export const getProjectMembers = async ( project_id ) =>{
    const result = await query(`SELECT u.user_id, u.f_name, u.l_name, u.email, pm.role
        FROM project_members pm
        JOIN users u ON pm.user_id = u.user_id
        WHERE pm.project_id = $1
        ORDER BY pm.role DESC, u.f_name`, [project_id]);
        return result.rows;
}

// remove member
export const removeMember = async(project_id, user_id) =>{
    await query(`DELETE FROM project_members WHERE project_id = $1 AND user_id = $2`,[project_id, user_id]);

}

