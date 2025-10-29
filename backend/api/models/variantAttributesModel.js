import db from "../config/db.js";

export const getVariantAttributes = async (variantId) => {
  const [rows] = await db.query(
    `SELECT a.AttributeName, av.Value
     FROM variant_attribute_values va
     JOIN attribute_values av ON va.AttributeValueID = av.AttributeValueID
     JOIN attributes a ON av.AttributeID = a.AttributeID
     WHERE va.VariantID = ?`,
    [variantId]
  );
  return rows;
};

export const setVariantAttributes = async (variantId, attributeValueIds = []) => {
  await db.query(`DELETE FROM variant_attribute_values WHERE VariantID = ?`, [variantId]);
  if (!attributeValueIds.length) return;
  const values = attributeValueIds.map((v) => [variantId, v]);
  await db.query(
    `INSERT INTO variant_attribute_values (VariantID, AttributeValueID) VALUES ?`,
    [values]
  );
};

export const deleteVariantAttributes = async (variantId) => {
  await db.query(`DELETE FROM variant_attribute_values WHERE VariantID = ?`, [variantId]);
};
