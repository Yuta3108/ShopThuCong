import express from "express";
import {
  getAttributeValues,
  createAttributeValueController,
  updateAttributeValueController,
  deleteAttributeValueController,
} from "../controllers/attributeValuesController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// View (ai cũng xem được)
router.get("/", getAttributeValues);

// Admin only
router.post("/", authMiddleware, adminMiddleware, createAttributeValueController);
router.put("/:id", authMiddleware, adminMiddleware, updateAttributeValueController);
router.delete("/:id", authMiddleware, adminMiddleware, deleteAttributeValueController);

export default router;
