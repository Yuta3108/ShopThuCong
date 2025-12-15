import express from "express";
import {
  getProducts,
  getProductDetail,
  createProductController,
  updateProductController,
  deleteProductController,
  getProductDetailBySlugAndCode
} from "../controllers/productController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/**  Public routes */
router.get("/", getProducts);
router.get("/:id", getProductDetail);
router.get("/:categorySlug/:productCode",getProductDetailBySlugAndCode);

/**  Admin-only routes */
router.post("/", authMiddleware, adminMiddleware, createProductController);
router.put("/:id", authMiddleware, adminMiddleware, updateProductController);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProductController);

export default router;
