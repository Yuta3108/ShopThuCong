import express from "express";
import { getCategories,getCategoryBySlug } from "../controllers/categoryController.js";

const router = express.Router();
router.get("/", getCategories);
router.get("/slug/:slug", getCategoryBySlug);
export default router;
