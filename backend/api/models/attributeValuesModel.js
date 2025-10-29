import db from "../config/db.js";

export const getAllValues = async () => {
  const [rows] = await db.query(`
    SELECT v.*, a.AttributeName 
    FROM attribute_values v
    JOIN attributes a ON a.AttributeID = v.AttributeID
    ORDER BY v.AttributeID, v.AttributeValueID
  `);
  return rows;
};

export const createValue = async (AttributeID, Value) => {
  const [res] = await db.query(
    `INSERT INTO attribute_values (AttributeID, Value) VALUES (?, ?)`,
    [AttributeID, Value]
  );
  return res.insertId;
};

export const updateValue = async (id, Value) => {
  const [res] = await db.query(
    `UPDATE attribute_values SET Value = ? WHERE AttributeValueID = ?`,
    [Value, id]
  );
  return res.affectedRows > 0;
};

// 🔧 Sửa tên bảng liên kết cho đúng schema của anh
export const deleteValue = async (id) => {
  await db.query(
    `DELETE FROM variant_attribute_values WHERE AttributeValueID = ?`,
    [id]
  );
  const [res] = await db.query(
    `DELETE FROM attribute_values WHERE AttributeValueID = ?`,
    [id]
  );
  return res.affectedRows > 0;
};
