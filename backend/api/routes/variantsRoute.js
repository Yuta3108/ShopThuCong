import express from "express";
import {
  createVariantController,
  updateVariantController,
  deleteVariantController,
  uploadVariantImage,
  deleteImageController,
  setVariantAttributesController
} from "../controllers/variantController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/**  Variants management  */
router.post("/:productId", authMiddleware, adminMiddleware, createVariantController);
router.put("/:variantId", authMiddleware, adminMiddleware, updateVariantController);
router.delete("/:variantId", authMiddleware, adminMiddleware, deleteVariantController);

/** Images management  */
router.post("/:variantId/images", authMiddleware, adminMiddleware, uploadVariantImage);
router.delete("/images/:imageId", authMiddleware, adminMiddleware, deleteImageController);

/**  Attributes mapping */
router.put("/:variantId/attributes", authMiddleware, adminMiddleware, setVariantAttributesController);

export default router;
