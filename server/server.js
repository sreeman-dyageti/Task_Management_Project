import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import taskRouter from "./src/task/task.router.js";
import authRouter from "./src/auth/route.js";
import projectRouter from "./src/project/project.router.js";
import commentRouter from "../server/src/comment/comment.router.js";
import activityRouter from "../server/src/activity/activity.router.js";
import notificationRouter from "./src/notifications/notifications.router.js";
import { startNotificationCron } from "./src/notifications/notifications.corn.js";
import dashboardRouter from "./src/dashboard/dashboard.router.js";
import reportRouter from "./src/report/report.router.js";

dotenv.config();

const app = express();

app.use(cors({origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/auth", authRouter);
app.use("/tasks", taskRouter);
app.use('/project', projectRouter);
app.use("/comment", commentRouter);
app.use('/activity', activityRouter);
app.use("/notifications", notificationRouter);
app.use('/dashboard', dashboardRouter);
app.use('/report', reportRouter);
startNotificationCron();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {console.log(`Server running on port ${PORT}`);
});