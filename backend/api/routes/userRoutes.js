// routes/userRoutes.js
import express from "express";
import { dangKy, dangNhap } from "../controllers/userController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";
import db from "../config/db.js";

const router = express.Router();

// Đăng ký & đăng nhập
router.post("/khachhang/dangky", dangKy);
router.post("/khachhang/dangnhap", dangNhap);

// Chỉ admin được phép xem danh sách người dùng
router.get("/khachhang/all", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, tenKhachHang, email, role FROM users"
    );
    res.json(rows);
  } catch (err) {
    console.error("🔥 Lỗi truy vấn DB:", err);
    res.status(500).json({ message: "Lỗi truy vấn DB", error: err.message });
  }
});

export default router;
