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
  statisticOrderByStatus,
  dashboardSummary,
  revenueByMonth,
  topSellingProducts,
  latestOrder,
  revenueByTime,
} from "../controllers/orderController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
// dashboard
router.get("/statistic-by-status", authMiddleware, adminMiddleware,statisticOrderByStatus);
router.get("/dashboard-summary", authMiddleware, adminMiddleware, dashboardSummary);
router.get("/revenue-by-month", authMiddleware, adminMiddleware, revenueByMonth);
router.get("/top-selling-products", authMiddleware, adminMiddleware, topSellingProducts);
router.get("/lastest", authMiddleware, adminMiddleware, latestOrder);
router.get("/revenue", authMiddleware, adminMiddleware, revenueByTime);

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
