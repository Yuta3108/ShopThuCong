import db from "../config/db.js";

export const createVariant = async ({ ProductID, SKU, Price, StockQuantity = 0, Weight = null, IsActive = 1, attributeValueIds = [] }) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    let finalSKU = SKU?.trim();

    if (!finalSKU) {
      const [[p]] = await conn.query("SELECT SKU FROM products WHERE ProductID = ?", [ProductID]);
      const [[countRes]] = await conn.query("SELECT COUNT(*) AS count FROM product_variants WHERE ProductID = ?", [ProductID]);
      finalSKU = p?.SKU ? `${p.SKU}-${countRes.count + 1}` : `P${ProductID}-${Date.now().toString().slice(-4)}`;
    }

    const [[exist]] = await conn.query("SELECT VariantID FROM product_variants WHERE SKU = ?", [finalSKU]);
    if (exist) throw new Error(`SKU '${finalSKU}' đã tồn tại.`);

    const [variantRes] = await conn.query(`
      INSERT INTO product_variants 
        (ProductID, SKU, Price, StockQuantity, Weight, IsActive, CreatedAt)
      VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [ProductID, finalSKU, Price, StockQuantity, Weight, IsActive]
    );

    const VariantID = variantRes.insertId;
    if (attributeValueIds?.length) {
      const values = [...new Set(attributeValueIds)].map(v => [VariantID, v]);
      await conn.query(`INSERT IGNORE INTO variant_attribute_values (VariantID, AttributeValueID) VALUES ?`, [values]);
    }

    await conn.commit();
    return { VariantID };
  } catch (err) {
    await conn.rollback();
    console.error("createVariant error:", err);
    throw err;
  } finally {
    conn.release();
  }
};

export const updateVariant = async (id, data) => {
  const { Price, StockQuantity, IsActive, attributeValueIds = [] } = data;
  const [res] = await db.query(`
    UPDATE product_variants SET Price=?, StockQuantity=?, IsActive=?, UpdatedAt=NOW() WHERE VariantID=?`,
    [Price, StockQuantity, IsActive, id]
  );

  await db.query(`DELETE FROM variant_attribute_values WHERE VariantID = ?`, [id]);
  if (attributeValueIds?.length) {
    const vals = [...new Set(attributeValueIds)].map(v => [id, v]);
    await db.query(`INSERT IGNORE INTO variant_attribute_values (VariantID, AttributeValueID) VALUES ?`, [vals]);
  }
  return res.affectedRows > 0;
};

export const deleteVariant = async (id) => {
  const [res] = await db.query(`DELETE FROM product_variants WHERE VariantID = ?`, [id]);
  return res.affectedRows > 0;
};

export const addVariantImage = async ({ VariantID, ImageURL, PublicID, DisplayOrder = 1 }) => {
  const [check] = await db.query(`SELECT VariantID FROM product_variants WHERE VariantID = ?`, [VariantID]);
  if (!check.length) throw new Error(`Biến thể ${VariantID} không tồn tại.`);
  const [res] = await db.query(
    `INSERT INTO images (VariantID, ImageURL, PublicID, DisplayOrder) VALUES (?, ?, ?, ?)`,
    [VariantID, ImageURL, PublicID, DisplayOrder]
  );
  return res.insertId;
};

export const deleteImage = async (ImageID) => {
  const [[row]] = await db.query(`SELECT PublicID FROM images WHERE ImageID = ?`, [ImageID]);
  if (!row) return null;
  await db.query(`DELETE FROM images WHERE ImageID = ?`, [ImageID]);
  return row.PublicID;
};

export const setVariantAttributes = async (variantId, attributeValueIds = []) => {
  await db.query(`DELETE FROM variant_attribute_values WHERE VariantID = ?`, [variantId]);
  if (!attributeValueIds?.length) return;
  const vals = [...new Set(attributeValueIds)].map(v => [variantId, v]);
  await db.query(`INSERT IGNORE INTO variant_attribute_values (VariantID, AttributeValueID) VALUES ?`, [vals]);
};
