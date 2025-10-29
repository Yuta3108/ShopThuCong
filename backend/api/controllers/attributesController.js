import {
  getAllAttributes,
  createAttribute,
  updateAttribute,
  deleteAttribute,
} from "../models/attributesModel.js";

export const getAttributes = async (req, res) => {
  try {
    const result = await getAllAttributes();
    res.json(result);
  } catch (e) {
    console.error("getAttributes error:", e);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

export const createAttributeController = async (req, res) => {
  try {
    const { AttributeName } = req.body;
    if (!AttributeName || !AttributeName.trim()) {
      return res
        .status(400)
        .json({ message: "Tên thuộc tính không được để trống" });
    }

    const id = await createAttribute({ AttributeName: AttributeName.trim() });
    res
      .status(201)
      .json({ message: "Thêm thuộc tính thành công", AttributeID: id });
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};

export const updateAttributeController = async (req, res) => {
  try {
    const ok = await updateAttribute(req.params.id, req.body.AttributeName);
    if (!ok) return res.status(404).json({ message: "Không tìm thấy thuộc tính" });
    res.json({ message: "Cập nhật thành công" });
  } catch (e) {
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

export const deleteAttributeController = async (req, res) => {
  try {
    const ok = await deleteAttribute(req.params.id);
    if (!ok) return res.status(404).json({ message: "Không tìm thấy thuộc tính" });
    res.json({ message: "Xoá thành công" });
  } catch (e) {
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};
