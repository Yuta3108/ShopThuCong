import {
  getAllCategories,
  getCategoryBySlug,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  checkSlugExist,
  clearCategoryImage,
} from "../models/CategoryModel.js";

import cloudinary from "../config/cloudinary.js";
import { slugify } from "../config/slugify.js";

// GET ALL
export const getCategories = async (req, res) => {
  try {
    res.json(await getAllCategories());
  } catch {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// GET BY SLUG
export const getCategoryBySlugController = async (req, res) => {
  try {
    const category = await getCategoryBySlug(req.params.slug);
    if (!category)
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    res.json(category);
  } catch {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// CREATE (BASE64 → CLOUDINARY)
export const createCategoryController = async (req, res) => {
  try {
    const { CategoryName, Description, imageBase64 } = req.body;
    if (!CategoryName)
      return res.status(400).json({ message: "Thiếu tên danh mục!" });

    // upload cloudinary
    let imageUrl = null;
    let imagePublicId = null;

    if (imageBase64) {
      const upload = await cloudinary.uploader.upload(imageBase64, {
        folder: "categories",
      });
      imageUrl = upload.secure_url;
      imagePublicId = upload.public_id;
    }

    // auto slug
    let slug = slugify(CategoryName);
    let baseSlug = slug;
    let count = 1;
    while (await checkSlugExist(slug)) {
      slug = `${baseSlug}-${count++}`;
    }

    const id = await createCategory(
      CategoryName,
      slug,
      Description,
      imageUrl,
      imagePublicId
    );

    res.json({ message: "Thêm danh mục thành công!", id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// UPDATE (XOÁ ẢNH CŨ → UP ẢNH MỚI)
export const updateCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const { CategoryName, Description, imageBase64 } = req.body;

    if (!CategoryName)
      return res.status(400).json({ message: "Thiếu tên danh mục!" });

    const old = await getCategoryById(id);
    if (!old)
      return res.status(404).json({ message: "Không tìm thấy danh mục!" });

    let imageUrl = old.ImageURL;
    let imagePublicId = old.ImagePublicID;

    // nếu có ảnh mới → xoá ảnh cũ
    if (imageBase64) {
      if (imagePublicId) {
        await cloudinary.uploader.destroy(imagePublicId);
      }

      const upload = await cloudinary.uploader.upload(imageBase64, {
        folder: "categories",
      });
      imageUrl = upload.secure_url;
      imagePublicId = upload.public_id;
    }

    // auto slug
    let slug = slugify(CategoryName);
    let baseSlug = slug;
    let count = 1;
    while (await checkSlugExist(slug, id)) {
      slug = `${baseSlug}-${count++}`;
    }

    await updateCategory(
      id,
      CategoryName,
      slug,
      Description,
      imageUrl,
      imagePublicId
    );

    res.json({ message: "Cập nhật danh mục thành công!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// DELETE IMAGE RIÊNG
export const deleteCategoryImageController = async (req, res) => {
  try {
    const { id } = req.params;

    const publicId = await clearCategoryImage(id);
    if (!publicId)
      return res.status(404).json({ message: "Không có ảnh để xoá!" });

    await cloudinary.uploader.destroy(publicId);

    res.json({ message: "Xoá ảnh danh mục thành công!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// DELETE CATEGORY
export const deleteCategoryController = async (req, res) => {
  try {
    const { id } = req.params;

    const publicId = await deleteCategory(id);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }

    res.json({ message: "Xoá danh mục thành công!" });
  } catch {
    res.status(500).json({ message: "Lỗi server" });
  }
};
