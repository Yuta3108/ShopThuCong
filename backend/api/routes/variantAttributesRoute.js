import express from "express";
import {
  getVariantAttributesController,
  setVariantAttributesController,
  deleteVariantAttributesController,
} from "../controllers/variantAttributesController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Xem thuộc tính của 1 variant (ai cũng xem được)
router.get("/:variantId", getVariantAttributesController);

// Admin gán/cập nhật hoặc xoá toàn bộ thuộc tính của 1 variant
router.post("/:variantId", authMiddleware, adminMiddleware, setVariantAttributesController);
router.delete("/:variantId", authMiddleware, adminMiddleware, deleteVariantAttributesController);

export default router;
