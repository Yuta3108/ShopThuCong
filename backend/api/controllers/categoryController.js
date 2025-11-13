import { getAllCategories,getCategoryBySlug as getSlugModel } from "../models/CategoryModel.js";

export const getCategories = async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch (err) {
    console.error("Lỗi khi lấy danh mục:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await getSlugModel(slug);

    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    res.json(category);
  } catch (err) {
    console.error("Lỗi getCategoryBySlug:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};