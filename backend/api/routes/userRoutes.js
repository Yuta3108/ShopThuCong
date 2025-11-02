// routes/userRoutes.js
import express from "express";
import { dangKy, dangNhap,yeuCauDatLaiMatKhau,datLaiMatKhau } from "../controllers/userController.js";

const router = express.Router();

// Đăng ký & đăng nhập
router.post("/dangky", dangKy);
router.post("/dangnhap", dangNhap);
router.post("/forgot-password", yeuCauDatLaiMatKhau);
router.post("/reset-password", datLaiMatKhau);


export default router;
