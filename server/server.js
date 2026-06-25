import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import taskRouter from "./src/task/task.router.js";
import authRouter from "./src/auth/route.js";

dotenv.config();

const app = express();

app.use(cors({origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/auth", authRouter);
app.use("/tasks", taskRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {console.log(`Server running on port ${PORT}`);
});