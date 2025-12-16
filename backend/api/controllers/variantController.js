import {
  createVariant,
  updateVariant,
  deleteVariant,
  addVariantImage,
  deleteImage,
  setVariantAttributes,
} from "../models/variantsModel.js";
import cloudinary from "../config/cloudinary.js";

export const createVariantController = async (req, res) => {
  try {
    const ProductID = Number(req.params.productId); 
    const {
      ProductCode,
      Price,
      StockQuantity = 0,
      IsActive = 1,
      attributeValueIds = [],
      images = [],
    } = req.body;

    console.log(" createVariant body:", req.body, "ProductID:", ProductID);
    const { VariantID } = await createVariant({
      ProductID,
      ProductCode,
      Price,
      StockQuantity,
      IsActive,
      attributeValueIds,
    });
    res
      .status(201)
      .json({ message: "Tạo biến thể thành công", VariantID });
  } catch (err) {
    console.error("createVariantController error:", err);
    res
      .status(500)
      .json({
        message: "Lỗi khi tạo biến thể",
        error: err.message,
      });
  }
};

export const updateVariantController = async (req, res) => {
  try {
    const id = Number(req.params.variantId);
    console.log("updateVariant body:", req.body, "variantId:", id);
    const result = await updateVariant(id, req.body);
    res.json(result);
  } catch (err) {
    console.error("updateVariantController error:", err);
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật biến thể", error: err.message });
  }
};

export const deleteVariantController = async (req, res) => {
  try {
    const id = Number(req.params.variantId);
    console.log(" deleteVariant ID:", id);
    const result = await deleteVariant(id);
    res.json({ message: "Xoá biến thể thành công", result });
  } catch (err) {
    console.error("deleteVariantController error:", err);
    res
      .status(500)
      .json({ message: "Lỗi khi xoá biến thể", error: err.message });
  }
};

export const setVariantAttributesController = async (req, res) => {
  try {
    const VariantID = Number(req.params.variantId);
    await setVariantAttributes(VariantID, req.body.attributeValueIds || []);
    res.json({ message: "Cập nhật thuộc tính thành công" });
  } catch (err) {
    console.error("setVariantAttributesController error:", err);
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật thuộc tính", error: err.message });
  }
};
export const uploadVariantImage = async (req, res) => {
  try {
    const VariantID = Number(req.params.variantId);
    const { image } = req.body;
    const result = await cloudinary.uploader.upload(image, {
      folder: "shopthucong/variants",
    });
    const ImageID = await addVariantImage({
      VariantID,
      ImageURL: result.secure_url,
      PublicID: result.public_id,
    });
    res
      .status(201)
      .json({
        message: "Upload thành công",
        ImageID,
        ImageURL: result.secure_url,
      });
  } catch (err) {
    console.error("uploadVariantImage error:", err);
    res
      .status(500)
      .json({ message: "Lỗi upload ảnh", error: err.message });
  }
};

export const deleteImageController = async (req, res) => {
  try {
    const id = Number(req.params.imageId);
    const publicId = await deleteImage(id);
    if (publicId) await cloudinary.uploader.destroy(publicId);
    res.json({ message: "Xoá ảnh thành công" });
  } catch (err) {
    console.error("deleteImageController error:", err);
    res
      .status(500)
      .json({ message: "Lỗi khi xoá ảnh", error: err.message });
  }
};
