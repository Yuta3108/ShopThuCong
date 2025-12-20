import express from "express";
import {
  getCategories,
  getCategoryBySlugController,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
  deleteCategoryImageController
} from "../controllers/categoryController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

// GET
router.get("/", getCategories);
router.get("/slug/:slug", getCategoryBySlugController);

// CREATE
router.post("/", authMiddleware,adminMiddleware, createCategoryController);

// UPDATE
router.put("/:id", authMiddleware,adminMiddleware, updateCategoryController);

// DELETE
router.delete("/:id/image", authMiddleware,adminMiddleware, deleteCategoryImageController);
router.delete("/:id", authMiddleware,adminMiddleware,deleteCategoryController);

export default router;
