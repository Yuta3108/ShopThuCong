import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./api/routes/userRoutes.js";
import userManageRoutes from "./api/routes/userManageRoutes.js";
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", userRoutes);
app.use("/api/users", userManageRoutes);
app.get("/check", (req, res) => {
  res.send("ShopThuCong User API is running...");
});
console.log("JWT_SECRET:", process.env.JWT_SECRET);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server chạy tại cổng ${PORT}`));
