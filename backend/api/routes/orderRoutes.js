import express from "express";
import {
  createOrderFromCart,
  getAllOrders,
  getOrderDetail,
  getMyOrders,
  deleteOrder,
  updateOrderStatus,
  cancelOrder,
  cancelOrderZalo,
} from "../controllers/orderController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// USER
router.get("/user/:id", authMiddleware, getMyOrders);
router.post("/", authMiddleware, createOrderFromCart);
router.post("/:orderId/cancel", authMiddleware, cancelOrder);
router.post("/:orderId/cancel-zalopay", authMiddleware, cancelOrderZalo);
// ADMIN
router.get("/", authMiddleware, adminMiddleware, getAllOrders);
router.get("/:id", authMiddleware, getOrderDetail);
router.put("/:id", authMiddleware, adminMiddleware, updateOrderStatus);
router.delete("/:id", authMiddleware, adminMiddleware, deleteOrder);

export default router;
