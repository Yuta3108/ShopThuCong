import express from "express";
import {
  createZaloPayOrder,
  zaloPayCallback,
} from "./zaloPayController.js";
import { authMiddleware} from "../middleware/authMiddleware.js";
const router = express.Router();

// POSTMAN gọi route này
router.post("/zalopay",authMiddleware, createZaloPayOrder);

// Callback từ ZaloPay
router.post("/zalo-callback", zaloPayCallback);

export default router;
