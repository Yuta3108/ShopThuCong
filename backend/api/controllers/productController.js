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
import cloudinary from "../config/cloudinary.js";

/* ==================== PRODUCTS ==================== */
export const getProducts = async (req, res) => {
  try {
    const filters = {
      q: req.query.q,
      categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      isActive: req.query.isActive ? Number(req.query.isActive) : undefined,
      page: req.query.page,
      pageSize: req.query.pageSize,
      sort: req.query.sort,
    };

    const result = await findProducts(filters);
    res.json(result);
  } catch (e) {
    console.error("getProducts error:", e);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

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

/* ==================== CREATE PRODUCT ==================== */
export const createProductController = async (req, res) => {
  try {
    if ((req.user?.role || req.user?.Role) !== "admin")
      return res.status(403).json({ message: "Chỉ admin mới được thêm sản phẩm" });

    const { variants = [], ...productData } = req.body;
    const ProductID = await createProduct(productData);

    // Lặp qua các biến thể để thêm
    for (const v of variants) {
      const { VariantID: variantId } = await createVariant({
        ProductID,
        SKU: v.SKU,
        Price: v.Price,
        StockQuantity: v.StockQuantity ?? 0,
        Weight: v.Weight || null,
        IsActive: v.IsActive ?? 1,
        attributeValueIds: v.attributeValueIds || [],
      });

      // Upload ảnh cho từng biến thể
      if (v.images?.length) {
        for (const img of v.images) {
          if (typeof img === "string" && img.startsWith("data:image")) {
            const result = await cloudinary.uploader.upload(img, {
              folder: "shopthucong/public",
              use_filename: true,
              unique_filename: true,
            });
            await addVariantImage({
              VariantID: variantId,
              ImageURL: result.secure_url,
              PublicID: result.public_id,
              DisplayOrder: 1,
            });
          }
        }
      }
    }

    res.status(201).json({
      message: "Tạo sản phẩm và biến thể thành công",
      ProductID,
    });
  } catch (e) {
    console.error("createProduct error:", e);
    res.status(500).json({ message: "Lỗi máy chủ", error: e.message });
  }
};

/* ==================== UPDATE PRODUCT ==================== */
export const updateProductController = async (req, res) => {
  try {
    if ((req.user?.role || req.user?.Role) !== "admin")
      return res.status(403).json({ message: "Chỉ admin mới được chỉnh sửa sản phẩm" });

    const affected = await updateProductModel(Number(req.params.id), req.body);
    if (!affected) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.json({ message: "Cập nhật sản phẩm thành công" });
  } catch (e) {
    console.error("updateProduct error:", e);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

/* ==================== DELETE PRODUCT ==================== */
export const deleteProductController = async (req, res) => {
  try {
    if ((req.user?.role || req.user?.Role) !== "admin")
      return res.status(403).json({ message: "Chỉ admin mới được xoá sản phẩm" });

    const affected = await deleteProductModel(Number(req.params.id));
    if (!affected) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.json({ message: "Xoá sản phẩm thành công" });
  } catch (e) {
    console.error("deleteProduct error:", e);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

/* ==================== VARIANTS ==================== */
export const createVariantController = async (req, res) => {
  try {
    if ((req.user?.role || req.user?.Role) !== "admin")
      return res.status(403).json({ message: "Chỉ admin mới được thêm biến thể" });

    const ProductID = Number(req.params.id);
    const {
      SKU,
      Price,
      StockQuantity = 0,
      Weight = 0,
      IsActive = 1,
      attributeValueIds = [],
      images = [],
    } = req.body;

    // ⚙️ Lấy đúng VariantID từ object trả về
    const { VariantID: variantId } = await createVariant({
      ProductID,
      SKU,
      Price,
      StockQuantity,
      Weight,
      IsActive,
      attributeValueIds,
    });

    // Upload ảnh cho biến thể
    if (images?.length) {
      for (const img of images) {
        if (typeof img === "string" && img.startsWith("data:image")) {
          const result = await cloudinary.uploader.upload(img, {
            folder: "shopthucong/public",
            use_filename: true,
            unique_filename: true,
          });
          await addVariantImage({
            VariantID: variantId,
            ImageURL: result.secure_url,
            PublicID: result.public_id,
            DisplayOrder: 1,
          });
        }
      }
    }

    res.status(201).json({ message: "Tạo biến thể thành công", VariantID: variantId });
  } catch (e) {
    console.error("createVariant error:", e);
    res.status(500).json({ message: "Lỗi máy chủ", error: e.message });
  }
};

/* ==================== UPDATE VARIANT ==================== */
export const updateVariantController = async (req, res) => {
  try {
    if ((req.user?.role || req.user?.Role) !== "admin")
      return res.status(403).json({ message: "Chỉ admin mới được sửa biến thể" });

    const variantId = Number(req.params.variantId);
    const { images, ...data } = req.body;

    const ok = await updateVariantModel(variantId, data);
    if (!ok) return res.status(404).json({ message: "Không tìm thấy biến thể" });

    if (images?.length) {
      for (const img of images) {
        if (typeof img === "string" && img.startsWith("data:image")) {
          const result = await cloudinary.uploader.upload(img, {
            folder: "shopthucong/public",
            use_filename: true,
            unique_filename: true,
          });
          await addVariantImage({
            VariantID: variantId,
            ImageURL: result.secure_url,
            PublicID: result.public_id,
            DisplayOrder: 1,
          });
        }
      }
    }

    res.json({ message: "Cập nhật biến thể thành công" });
  } catch (e) {
    console.error("updateVariant error:", e);
    res.status(500).json({ message: "Lỗi máy chủ", error: e.message });
  }
};

/* ==================== DELETE VARIANT ==================== */
export const deleteVariantController = async (req, res) => {
  try {
    if ((req.user?.role || req.user?.Role) !== "admin")
      return res.status(403).json({ message: "Chỉ admin mới được xoá biến thể" });

    const variantId = Number(req.params.variantId);
    const ok = await deleteVariantModel(variantId);

    if (!ok) return res.status(404).json({ message: "Không tìm thấy biến thể" });
    res.json({ message: "Xoá biến thể thành công" });
  } catch (e) {
    console.error("deleteVariant error:", e);
    res.status(500).json({ message: "Lỗi máy chủ", error: e.message });
  }
};

/* ==================== SET VARIANT ATTRIBUTES ==================== */
export const setVariantAttributesController = async (req, res) => {
  try {
    if ((req.user?.role || req.user?.Role) !== "admin")
      return res.status(403).json({ message: "Chỉ admin mới được cập nhật thuộc tính" });

    const VariantID = Number(req.params.variantId);
    const { attributeValueIds = [] } = req.body;
    await setVariantAttributes(VariantID, attributeValueIds);

    res.json({ message: "Cập nhật thuộc tính cho biến thể thành công" });
  } catch (e) {
    console.error("setVariantAttributes error:", e);
    res.status(500).json({ message: "Lỗi máy chủ", error: e.message });
  }
};

/* ==================== IMAGES ==================== */
export const uploadVariantImage = async (req, res) => {
  try {
    if ((req.user?.role || req.user?.Role) !== "admin")
      return res.status(403).json({ message: "Chỉ admin mới được upload ảnh" });

    const VariantID = Number(req.params.variantId);
    const { image } = req.body;
    if (!image) return res.status(400).json({ message: "Thiếu dữ liệu ảnh" });

    const result = await cloudinary.uploader.upload(image, {
      folder: "shopthucong/public",
      use_filename: true,
      unique_filename: true,
    });

    const ImageID = await addVariantImage({
      VariantID,
      ImageURL: result.secure_url,
      PublicID: result.public_id,
      DisplayOrder: 1,
    });

    res.status(201).json({
      message: "Upload thành công",
      ImageID,
      ImageURL: result.secure_url,
    });
  } catch (err) {
    console.error("Upload Cloudinary lỗi:", err);
    res.status(500).json({ message: "Lỗi server khi upload ảnh", error: err.message });
  }
};

export const deleteImageController = async (req, res) => {
  try {
    if ((req.user?.role || req.user?.Role) !== "admin")
      return res.status(403).json({ message: "Chỉ admin mới được xoá ảnh" });

    const imageId = Number(req.params.imageId);
    const publicId = await deleteImage(imageId);
    if (!publicId)
      return res.status(404).json({ message: "Không tìm thấy ảnh để xoá" });

    try {
      await cloudinary.uploader.destroy(publicId);
    } catch {
      console.warn("⚠️ Không tìm thấy ảnh trên Cloudinary:", publicId);
    }

    res.json({ message: "Xoá ảnh thành công", imageId });
  } catch (err) {
    console.error("deleteImage error:", err);
    res.status(500).json({ message: "Lỗi server khi xoá ảnh" });
  }
};
