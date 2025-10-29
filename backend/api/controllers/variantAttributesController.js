import {
  getVariantAttributes,
  setVariantAttributes,
  deleteVariantAttributes,
} from "../models/variantAttributesModel.js";

/** ===== Lấy thuộc tính của 1 variant ===== */
export const getVariantAttributesController = async (req, res) => {
  try {
    const variantId = Number(req.params.variantId);
    const data = await getVariantAttributes(variantId);

    res.json({
      VariantID: variantId,
      attributes: data,
    });
  } catch (e) {
    console.error("getVariantAttributes error:", e);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

/** ===== Gán hoặc cập nhật thuộc tính cho variant ===== */
export const setVariantAttributesController = async (req, res) => {
  try {
    const variantId = Number(req.params.variantId);
    const { attributeValueIds = [] } = req.body;

    await setVariantAttributes(variantId, attributeValueIds);
    res.json({
      message: "Cập nhật thuộc tính cho biến thể thành công",
      variantId,
      attributeValueIds,
    });
  } catch (e) {
    console.error("setVariantAttributes error:", e);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

/** ===== Xoá toàn bộ thuộc tính của variant ===== */
export const deleteVariantAttributesController = async (req, res) => {
  try {
    const variantId = Number(req.params.variantId);
    await deleteVariantAttributes(variantId);

    res.json({ message: "Đã xoá toàn bộ thuộc tính của biến thể", variantId });
  } catch (e) {
    console.error("deleteVariantAttributes error:", e);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};
