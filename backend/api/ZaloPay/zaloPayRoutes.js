import express from "express";
import {
  createZaloPayOrder,
  zaloPayCallback,
  confirmZaloPayOrder,
  CancelZaloPayOrder
} from "./zaloPayController.js";
const router = express.Router();

// POSTMAN gọi route này
router.post("/zalopay", createZaloPayOrder);

// Callback từ ZaloPay
router.post("/zalo-callback", zaloPayCallback);
router.post("/confirm-zalopay",confirmZaloPayOrder);
router.post("/cancel-zalopay",CancelZaloPayOrder);
export default router;
