import express from "express";
import {
  createOrderFromCart,
  getAllOrders,
  getOrderDetail,
  getMyOrders,
  deleteOrder,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// USER
router.get("/user", authMiddleware, getMyOrders);
router.post("/", authMiddleware, createOrderFromCart);

// ADMIN
router.get("/", authMiddleware, adminMiddleware, getAllOrders);
router.get("/:id", authMiddleware, adminMiddleware, getOrderDetail);
router.put("/:id", authMiddleware, adminMiddleware, updateOrderStatus);
router.delete("/:id", authMiddleware, adminMiddleware, deleteOrder);

export default router;
