import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "../routes/userRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use("/api", userRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("☕ ShopThuCong API đang chạy trên Vercel!");
});

export default app;
