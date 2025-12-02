import {
  getAllCategories,
  getCategoryBySlug as getSlugModel,
  createCategory,
  updateCategory,
  deleteCategory
} from "../models/CategoryModel.js";

//  GET 
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

// CREATE 
export const createCategoryController = async (req, res) => {
  try {
    const { CategoryName, Slug, Description } = req.body;

    if (!CategoryName || !Slug)
      return res.status(400).json({ message: "Thiếu dữ liệu!" });

    const id = await createCategory(CategoryName, Slug, Description);
    res.json({ message: "Thêm danh mục thành công!", id });
  } catch {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// UPDATE 
export const updateCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const { CategoryName, Slug, Description } = req.body;

    const ok = await updateCategory(id, CategoryName, Slug, Description);
    if (!ok) return res.status(404).json({ message: "Không tìm thấy danh mục!" });

    res.json({ message: "Sửa danh mục thành công!" });
  } catch {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// DELETE 
export const deleteCategoryController = async (req, res) => {
  try {
    const { id } = req.params;

    const ok = await deleteCategory(id);
    if (!ok) return res.status(404).json({ message: "Không tìm thấy danh mục!" });

    res.json({ message: "Xoá danh mục thành công!" });
  } catch {
    res.status(500).json({ message: "Lỗi server" });
  }
};
