import express from "express";
import {
  createOrderFromCart,
  getAllOrders,
  getOrderDetail,
  getMyOrders,
} from "../controllers/orderController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/",authMiddleware, createOrderFromCart);
router.get("/",authMiddleware,adminMiddleware, getAllOrders);
router.get("/user",authMiddleware,getMyOrders);
router.get("/:id",authMiddleware,adminMiddleware, getOrderDetail);

export default router;
