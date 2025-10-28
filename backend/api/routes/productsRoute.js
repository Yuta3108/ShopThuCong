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
  addImageController,
  deleteImageController,
  setVariantAttributesController,
} from "../controllers/productController.js";

// import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/** Public (tuỳ bạn có khóa hay không) */
router.get("/", getProducts);
router.get("/:id", getProductDetail);

/** Admin (bạn bật middleware nếu cần) */
// router.post("/", authMiddleware, adminMiddleware, createProductController);
router.post("/", createProductController);
// router.put("/:id", authMiddleware, adminMiddleware, updateProductController);
router.put("/:id", updateProductController);
// router.delete("/:id", authMiddleware, adminMiddleware, deleteProductController);
router.delete("/:id", deleteProductController);

/** Variants */
router.post("/:id/variants", createVariantController);
router.put("/variants/:variantId", updateVariantController);
router.delete("/variants/:variantId", deleteVariantController);

/** Images */
router.post("/variants/:variantId/images", addImageController);
router.delete("/images/:imageId", deleteImageController);

/** Attributes mapping cho variant */
router.put("/variants/:variantId/attributes", setVariantAttributesController);

export default router;
