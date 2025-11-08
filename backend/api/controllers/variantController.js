import {
  createVariant,
  updateVariant,
  deleteVariant,
  addVariantImage,
  deleteImage,
  setVariantAttributes
} from "../models/variantsModel.js";
import cloudinary from "../config/cloudinary.js";

export const createVariantController = async (req, res) => {
  try {
    const ProductID = Number(req.params.id);
    const { SKU, Price, StockQuantity = 0, Weight, IsActive = 1, attributeValueIds = [], images = [] } = req.body;

    const { VariantID } = await createVariant({ ProductID, SKU, Price, StockQuantity, Weight, IsActive, attributeValueIds });
    for (const img of images || []) {
      if (img.startsWith("data:image")) {
        const up = await cloudinary.uploader.upload(img, { folder: "shopthucong/variants" });
        await addVariantImage({ VariantID, ImageURL: up.secure_url, PublicID: up.public_id });
      }
    }
    res.status(201).json({ message: "Tạo biến thể thành công", VariantID });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi tạo biến thể", error: err.message });
  }
};

export const updateVariantController = async (req, res) => {
  try {
    const id = Number(req.params.variantId);
    const { images, ...data } = req.body;
    const ok = await updateVariant(id, data);
    if (images?.length)
      for (const img of images)
        if (img.startsWith("data:image")) {
          const up = await cloudinary.uploader.upload(img, { folder: "shopthucong/variants" });
          await addVariantImage({ VariantID: id, ImageURL: up.secure_url, PublicID: up.public_id });
        }
    res.json(ok ? { message: "Cập nhật biến thể thành công" } : { message: "Không tìm thấy biến thể" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi cập nhật biến thể", error: err.message });
  }
};

export const deleteVariantController = async (req, res) => {
  try {
    const ok = await deleteVariant(Number(req.params.variantId));
    res.json(ok ? { message: "Xoá biến thể thành công" } : { message: "Không tìm thấy biến thể" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi xoá biến thể", error: err.message });
  }
};

export const setVariantAttributesController = async (req, res) => {
  try {
    const VariantID = Number(req.params.variantId);
    await setVariantAttributes(VariantID, req.body.attributeValueIds || []);
    res.json({ message: "Cập nhật thuộc tính thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi cập nhật thuộc tính", error: err.message });
  }
};

export const uploadVariantImage = async (req, res) => {
  try {
    const VariantID = Number(req.params.variantId);
    const { image } = req.body;
    const result = await cloudinary.uploader.upload(image, { folder: "shopthucong/variants" });
    const ImageID = await addVariantImage({ VariantID, ImageURL: result.secure_url, PublicID: result.public_id });
    res.status(201).json({ message: "Upload thành công", ImageID, ImageURL: result.secure_url });
  } catch (err) {
    res.status(500).json({ message: "Lỗi upload ảnh", error: err.message });
  }
};

export const deleteImageController = async (req, res) => {
  try {
    const id = Number(req.params.imageId);
    const publicId = await deleteImage(id);
    if (publicId) await cloudinary.uploader.destroy(publicId);
    res.json({ message: "Xoá ảnh thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi xoá ảnh", error: err.message });
  }
};
