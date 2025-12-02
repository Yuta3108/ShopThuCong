import express from "express";
import {
  getCategories,
  getCategoryBySlug,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController
} from "../controllers/categoryController.js";

const router = express.Router();

// GET
router.get("/", getCategories);
router.get("/slug/:slug", getCategoryBySlug);

// CREATE
router.post("/them", createCategoryController);

// UPDATE
router.put("/sua/:id", updateCategoryController);

// DELETE
router.delete("/xoa/:id", deleteCategoryController);

export default router;
