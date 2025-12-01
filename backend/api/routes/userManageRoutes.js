import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";
import {
  getAllUsersController,
  getUserByIdController,
  updateUserController,
  deleteUserController,
  updateUserStatusController,
  updateUserRoleController
} from "../controllers/userManageController.js";

const router = express.Router();

router.get("/all", authMiddleware, adminMiddleware, getAllUsersController);
router.get("/:id", authMiddleware, getUserByIdController);
router.put("/:id/status", authMiddleware, adminMiddleware, updateUserStatusController);
router.put("/:id", authMiddleware, updateUserController);
router.delete("/:id", authMiddleware, deleteUserController);
router.put("/:id/Role", authMiddleware, adminMiddleware, updateUserRoleController);
export default router;
