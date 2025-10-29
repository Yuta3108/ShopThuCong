import db from "../config/db.js";

// Lấy tất cả attributes + danh sách value con
export const getAllAttributes = async () => {
  const [attributes] = await db.query(
    `SELECT * FROM attributes ORDER BY AttributeID ASC`
  );

  for (const attr of attributes) {
    const [values] = await db.query(
      `SELECT * FROM attribute_values WHERE AttributeID = ? ORDER BY AttributeValueID ASC`,
      [attr.AttributeID]
    );
    attr.values = values;
  }

  return attributes;
};

export const createAttribute = async (data) => {
  const { AttributeName } = data;
  if (!AttributeName) throw new Error("Thiếu tên thuộc tính!");
  const [res] = await db.query(
    `INSERT INTO attributes (AttributeName) VALUES (?)`,
    [AttributeName]
  );

  return res.insertId;
};

export const updateAttribute = async (id, name) => {
  const [res] = await db.query(
    `UPDATE attributes SET AttributeName = ?, UpdatedAt = NOW() WHERE AttributeID = ?`,
    [name, id]
  );
  return res.affectedRows > 0;
};

export const deleteAttribute = async (id) => {
  // Xoá values con trước (FK CASCADE cũng được, nhưng thêm cho chắc)
  await db.query(`DELETE FROM attribute_values WHERE AttributeID = ?`, [id]);
  const [res] = await db.query(
    `DELETE FROM attributes WHERE AttributeID = ?`,
    [id]
  );
  return res.affectedRows > 0;
};
