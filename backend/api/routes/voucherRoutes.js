import express from "express";
import {
  getVouchersController,
  createVoucherController,
  updateVoucherController,
  deleteVoucherController,
  applyVoucherController
} from "../controllers/voucherController.js";

import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// USER: chỉ được áp dụng voucher
router.post("/apply", applyVoucherController);

// ADMIN: quản lý voucher
router.get("/", authMiddleware, adminMiddleware, getVouchersController);
router.post("/", authMiddleware, adminMiddleware, createVoucherController);
router.put("/:id", authMiddleware, adminMiddleware, updateVoucherController);
router.delete("/:id", authMiddleware, adminMiddleware, deleteVoucherController);

export default router;
