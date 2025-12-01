// routes/userRoutes.js
import express from "express";
import { dangKy, dangNhap,yeuCauDatLaiMatKhau,datLaiMatKhau,doiMatKhau,xacMinhEmail } from "../controllers/userController.js";

const router = express.Router();

// Đăng ký & đăng nhập
router.post("/dangky", dangKy);
router.post("/dangnhap", dangNhap);
router.post("/forgot-password", yeuCauDatLaiMatKhau);
router.post("/reset-password", datLaiMatKhau);
router.put("/:id/password", doiMatKhau);
router.get("/verify/:token", xacMinhEmail);
export default router;
