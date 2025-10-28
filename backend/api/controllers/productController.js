import {
  findProducts,
  findProductById,
  createProduct,
  updateProduct as updateProductModel,
  deleteProduct as deleteProductModel,
  createVariant,
  updateVariant as updateVariantModel,
  deleteVariant as deleteVariantModel,
  addVariantImage,
  deleteImage,
  setVariantAttributes,
} from "../models/productsModel.js";

/** GET /api/products */
export const getProducts = async (req, res) => {
  try {
    const {
      q,
      categoryId,
      minPrice,
      maxPrice,
      isActive,
      page,
      pageSize,
      sort,
    } = req.query;

    const result = await findProducts({
      q,
      categoryId: categoryId ? Number(categoryId) : undefined,
      minPrice: minPrice != null ? Number(minPrice) : undefined,
      maxPrice: maxPrice != null ? Number(maxPrice) : undefined,
      isActive: isActive != null ? Number(isActive) : undefined,
      page,
      pageSize,
      sort,
    });
    res.json(result);
  } catch (e) {
    console.error("getProducts error:", e);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

/** GET /api/products/:id */
export const getProductDetail = async (req, res) => {
  try {
    const product = await findProductById(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.json(product);
  } catch (e) {
    console.error("getProductDetail error:", e);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

/** POST /api/products */
export const createProductController = async (req, res) => {
  try {
    const id = await createProduct(req.body);
    res.status(201).json({ message: "Tạo sản phẩm thành công", ProductID: id });
  } catch (e) {
    console.error("createProduct error:", e);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

/** PUT /api/products/:id */
export const updateProductController = async (req, res) => {
  try {
    const affected = await updateProductModel(Number(req.params.id), req.body);
    if (!affected) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.json({ message: "Cập nhật sản phẩm thành công" });
  } catch (e) {
    console.error("updateProduct error:", e);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

/** DELETE /api/products/:id */
export const deleteProductController = async (req, res) => {
  try {
    const affected = await deleteProductModel(Number(req.params.id));
    if (!affected) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.json({ message: "Xóa sản phẩm thành công" });
  } catch (e) {
    console.error("deleteProduct error:", e);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

/** ===== Variants ===== */

/** POST /api/products/:id/variants */
export const createVariantController = async (req, res) => {
  try {
    if (Price < 0) {
    return res.status(400).json({ message: "Giá không được nhỏ hơn 0" });
    }
    if (StockQuantity < 0) {
    return res.status(400).json({ message: "Số lượng tồn kho không được nhỏ hơn 0" });
    }
    const ProductID = Number(req.params.id);
    const VariantID = await createVariant({ ...req.body, ProductID });
    res.status(201).json({ message: "Tạo biến thể thành công", VariantID });
  } catch (e) {
    console.error("createVariant error:", e);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

/** PUT /api/variants/:variantId */
export const updateVariantController = async (req, res) => {
  try {
    if (Price < 0) {
    return res.status(400).json({ message: "Giá không được nhỏ hơn 0" });
    }
    if (StockQuantity < 0) {
    return res.status(400).json({ message: "Số lượng tồn kho không được nhỏ hơn 0" });
    }
    const affected = await updateVariantModel(Number(req.params.variantId), req.body);
    if (!affected) return res.status(404).json({ message: "Không tìm thấy biến thể" });
    res.json({ message: "Cập nhật biến thể thành công" });
  } catch (e) {
    console.error("updateVariant error:", e);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

/** DELETE /api/variants/:variantId */
export const deleteVariantController = async (req, res) => {
  try {
    const affected = await deleteVariantModel(Number(req.params.variantId));
    if (!affected) return res.status(404).json({ message: "Không tìm thấy biến thể" });
    res.json({ message: "Xóa biến thể thành công" });
  } catch (e) {
    console.error("deleteVariant error:", e);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

/** ===== Images ===== */

/** POST /api/variants/:variantId/images */
export const addImageController = async (req, res) => {
  try {
    const VariantID = Number(req.params.variantId);
    const ImageID = await addVariantImage({ VariantID, ...req.body });
    res.status(201).json({ message: "Thêm ảnh thành công", ImageID });
  } catch (e) {
    console.error("addImage error:", e);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

/** DELETE /api/images/:imageId */
export const deleteImageController = async (req, res) => {
  try {
    const affected = await deleteImage(Number(req.params.imageId));
    if (!affected) return res.status(404).json({ message: "Không tìm thấy ảnh" });
    res.json({ message: "Xóa ảnh thành công" });
  } catch (e) {
    console.error("deleteImage error:", e);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

/** ===== Attributes mapping ===== */

/** PUT /api/variants/:variantId/attributes  (body: { attributeValueIds: number[] }) */
export const setVariantAttributesController = async (req, res) => {
  try {
    const VariantID = Number(req.params.variantId);
    const { attributeValueIds = [] } = req.body;
    await setVariantAttributes(VariantID, attributeValueIds);
    res.json({ message: "Cập nhật thuộc tính cho biến thể thành công" });
  } catch (e) {
    console.error("setVariantAttributes error:", e);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

