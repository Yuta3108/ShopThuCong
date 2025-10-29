import {
  getAllValues,
  createValue,
  updateValue,
  deleteValue,
} from "../models/attributeValuesModel.js";

export const getAttributeValues = async (req, res) => {
  try {
    const rows = await getAllValues();
    res.json(rows);
  } catch (e) {
    console.error("getAttributeValues error:", e);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

export const createAttributeValueController = async (req, res) => {
  try {
    const { AttributeID, Value } = req.body;
    if (!AttributeID || !Value)
      return res.status(400).json({ message: "Thiếu dữ liệu" });

    const id = await createValue(AttributeID, Value);
    res.status(201).json({ message: "Tạo giá trị thành công", AttributeValueID: id });
  } catch (e) {
    console.error("createAttributeValue error:", e);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

export const updateAttributeValueController = async (req, res) => {
  try {
    const ok = await updateValue(req.params.id, req.body.Value);
    if (!ok) return res.status(404).json({ message: "Không tìm thấy giá trị" });
    res.json({ message: "Cập nhật thành công" });
  } catch (e) {
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

export const deleteAttributeValueController = async (req, res) => {
  try {
    const ok = await deleteValue(req.params.id);
    if (!ok) return res.status(404).json({ message: "Không tìm thấy giá trị" });
    res.json({ message: "Xoá thành công" });
  } catch (e) {
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};
