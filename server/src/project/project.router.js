import express from 'express';
import { Router } from 'express';
import {addProject,getProject,myProjects,addProjectMember, members, deleteMember} from "../project/project.controller.js";
import { authenticate } from '../../middleware/auth.middleware.js';


const router = express.Router();

router.post("/createProject",authenticate, addProject);
router.get("/myProjects",authenticate,myProjects);
router.get('/:projectId', authenticate, getProject);
router.post("/:projectId/members",authenticate, addProjectMember);
router.get("/:projectId/members",authenticate,members);
router.delete("/:projectId/members/:userId",authenticate, deleteMember);

export default router;