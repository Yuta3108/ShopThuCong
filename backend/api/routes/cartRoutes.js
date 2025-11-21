import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getCart,
  addToCart,
  updateCart,
  removeCartItem,
  mergeCart
} from "../controllers/cartController.js";

const router = express.Router();

router.get("/", authMiddleware, getCart);
router.post("/add", authMiddleware, addToCart);
router.put("/update/:id", authMiddleware, updateCart);
router.delete("/remove/:id", authMiddleware, removeCartItem);
router.post("/merge", authMiddleware, mergeCart);

export default router;
