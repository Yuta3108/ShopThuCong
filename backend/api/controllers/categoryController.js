import { getAllCategories, getCategoryBySlug as getSlugModel } from "../models/CategoryModel.js";

export const getCategories = async (req, res) => {
  try {
    res.json(await getAllCategories());
  } catch {
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const getCategoryBySlug = async (req, res) => {
  try {
    const category = await getSlugModel(req.params.slug);
    if (!category) return res.status(404).json({ message: "Không tìm thấy danh mục" });
    res.json(category);
  } catch {
    res.status(500).json({ message: "Lỗi server" });
  }
};
