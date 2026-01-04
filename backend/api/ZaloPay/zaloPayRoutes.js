import express from "express";
import {
  createZaloPayOrder,
  zaloPayCallback,
  confirmZaloPayOrder
} from "./zaloPayController.js";
import { authMiddleware} from "../middleware/authMiddleware.js";
const router = express.Router();

// POSTMAN gọi route này
router.post("/zalopay",authMiddleware, createZaloPayOrder);

// Callback từ ZaloPay
router.post("/zalo-callback", zaloPayCallback);
router.post(
  "/confirm-zalopay", authMiddleware,confirmZaloPayOrder);
export default router;
