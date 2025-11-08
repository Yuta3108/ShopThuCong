import {
  findProducts,
  findProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from "../models/productsModel.js";
import cloudinary from "../config/cloudinary.js";

export const getProducts = async (req, res) => {
  try {
    const filters = req.query;
    res.json(await findProducts(filters));
  } catch (err) {
    console.error("getProducts error:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const getProductDetail = async (req, res) => {
  try {
    const product = await findProductById(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const createProductController = async (req, res) => {
  try {
    const { ImageURL, ...data } = req.body;
    let image = ImageURL;
    if (ImageURL?.startsWith("data:image")) {
      const upload = await cloudinary.uploader.upload(ImageURL, { folder: "shopthucong/products" });
      image = upload.secure_url;
    }
    const ProductID = await createProduct({ ...data, ImageURL: image });
    res.status(201).json({ message: "Tạo sản phẩm thành công", ProductID });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi tạo sản phẩm", error: err.message });
  }
};

export const updateProductController = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { ImageURL, ...data } = req.body;
    let image = ImageURL;
    if (ImageURL?.startsWith("data:image")) {
      const upload = await cloudinary.uploader.upload(ImageURL, { folder: "shopthucong/products" });
      image = upload.secure_url;
    }
    const ok = await updateProduct(id, { ...data, ImageURL: image });
    res.json(ok ? { message: "Cập nhật thành công" } : { message: "Không tìm thấy sản phẩm" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

export const deleteProductController = async (req, res) => {
  try {
    const ok = await deleteProduct(Number(req.params.id));
    res.json(ok ? { message: "Xoá sản phẩm thành công" } : { message: "Không tìm thấy sản phẩm" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
