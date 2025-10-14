import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "../routes/userRoutes.js"; // nếu routes nằm ngoài thư mục api

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", userRoutes);

app.get("/", (req, res) => {
  res.send("Backend API đang chạy trên Vercel");
});

export default app;
