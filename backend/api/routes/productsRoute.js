import express from "express";
import {
  getProducts,
  getProductDetail,
  createProductController,
  updateProductController,
  deleteProductController,
  createVariantController,
  updateVariantController,
  deleteVariantController,
  uploadVariantImage,
  deleteImageController,
  setVariantAttributesController,
} from "../controllers/productController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/** Public routes */
router.get("/", getProducts);
router.get("/:id", getProductDetail);

/** Admin-only routes */
router.post("/", authMiddleware, adminMiddleware, createProductController);
router.put("/:id", authMiddleware, adminMiddleware, updateProductController);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProductController);

/** Variants (Admin only) */
router.post("/:id/variants", authMiddleware, adminMiddleware, createVariantController);
router.put("/variants/:variantId", authMiddleware, adminMiddleware, updateVariantController);
router.delete("/variants/:variantId", authMiddleware, adminMiddleware, deleteVariantController);

/** Images (Admin only) */
router.post("/variants/:variantId/images", authMiddleware, adminMiddleware, uploadVariantImage);
router.delete("/images/:imageId", authMiddleware, adminMiddleware, deleteImageController);

/** Attributes mapping */
router.put("/variants/:variantId/attributes", authMiddleware, adminMiddleware, setVariantAttributesController);

export default router;
