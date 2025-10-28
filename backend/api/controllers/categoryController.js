import { getAllCategories } from "../models/CategoryModel.js";

export const getCategories = async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch (err) {
    console.error("Lỗi khi lấy danh mục:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
