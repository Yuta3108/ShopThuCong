import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserStatus,
} from "../controllers/userManageController.js";

const router = express.Router();

// 👑 Admin chỉ được xem toàn bộ user
router.get("/all", authMiddleware, adminMiddleware, getAllUsers);

// 👤 Khách hoặc admin xem thông tin cụ thể
router.get("/:id", authMiddleware, getUserById);
router.put("/:id/status", authMiddleware, adminMiddleware, updateUserStatus);
// 👤 Khách tự sửa tài khoản
router.put("/:id", authMiddleware, updateUser);

// 👤 Khách tự xoá tài khoản
router.delete("/:id", authMiddleware, deleteUser);

export default router;
