import express from "express";
import { dangKy, dangNhap } from "../controllers/userController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";
import db from "../config/db.js";

const router = express.Router();

router.post("/khachhang/dangky", dangKy);
router.post("/khachhang/dangnhap", dangNhap);

// Chỉ admin được phép xem danh sách người dùng
router.get("/khachhang/all", authMiddleware, adminMiddleware, (req, res) => {
  db.query("SELECT id, tenKhachHang, email, role FROM users", (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi truy vấn DB." });
    res.json(result);
  });
});

export default router;
