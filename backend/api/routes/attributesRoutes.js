import express from "express";
import {
  getAttributes,
  createAttributeController,
  updateAttributeController,
  deleteAttributeController,
} from "../controllers/attributesController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// View (ai cũng xem được)
router.get("/", getAttributes);

// Admin only
router.post("/", authMiddleware, adminMiddleware, createAttributeController);
router.put("/:id", authMiddleware, adminMiddleware, updateAttributeController);
router.delete("/:id", authMiddleware, adminMiddleware, deleteAttributeController);

export default router;
