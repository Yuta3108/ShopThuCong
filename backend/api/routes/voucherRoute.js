import express from "express";
import {
  getVouchers,
  createVoucherController,
  updateVoucherController,
  deleteVoucherController,
  applyVoucher
} from "../controllers/voucherController.js";

import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// USER: chỉ được sử dụng voucher
router.post("/apply", applyVoucher);

// ADMIN: quản lý voucher
router.get("/", authMiddleware, adminMiddleware, getVouchers);
router.post("/", authMiddleware, adminMiddleware, createVoucherController);
router.put("/:id", authMiddleware, adminMiddleware, updateVoucherController);
router.delete("/:id", authMiddleware, adminMiddleware, deleteVoucherController);

export default router;
