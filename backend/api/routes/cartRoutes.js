import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getCart,
  addToCart,
  removeCartItem,
  updateQuantity,
  mergeCart,
} from "../controllers/cartController.js";

const router = express.Router();

// Lấy giỏ hàng
router.get("/", authMiddleware, getCart);

// Thêm vào giỏ
router.post("/add", authMiddleware, addToCart);

// Cập nhật số lượng 
router.put("/updateQuantity/:id", authMiddleware, updateQuantity);

// Xóa item khỏi giỏ
router.delete("/remove/:id", authMiddleware, removeCartItem);

// Merge giỏ hàng local → server
router.post("/merge", authMiddleware, mergeCart);

export default router;
