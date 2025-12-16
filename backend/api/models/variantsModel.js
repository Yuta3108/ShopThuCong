import db from "../config/db.js";

export const createVariant = async ({ ProductID, ProductCode, Price, StockQuantity = 0, IsActive = 1, attributeValueIds = [] }) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    let finalProductCode = ProductCode?.trim();

    if (!finalProductCode) {
      const [[p]] = await conn.query("SELECT ProductCode FROM products WHERE ProductID = ?", [ProductID]);
      const [[countRes]] = await conn.query("SELECT COUNT(*) AS count FROM product_variants WHERE ProductID = ?", [ProductID]);
      finalProductCode = p?.ProductCode ? `${p.ProductCode}-${countRes.count + 1}` : `P${ProductID}-${Date.now().toString().slice(-4)}`;
    }

    const [[exist]] = await conn.query("SELECT VariantID FROM product_variants WHERE ProductCode = ?", [finalProductCode]);
    if (exist) throw new Error(`ProductCode '${finalProductCode}' đã tồn tại.`);

    const [variantRes] = await conn.query(`
      INSERT INTO product_variants 
        (ProductID, ProductCode, Price, StockQuantity, IsActive, CreatedAt)
      VALUES (?, ?, ?, ?, ?, NOW())`,
      [ProductID, finalProductCode, Price, StockQuantity, IsActive]
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
  try {
    const {
      Price,
      StockQuantity,
      IsActive,
      attributeValueIds = []
    } = data; // chỉ lấy đúng field cần update

    // ép kiểu an toàn
    const priceNum = parseFloat(Price) || 0;
    const stockNum = parseInt(StockQuantity) || 0;

    await db.query(
      `UPDATE product_variants
       SET Price=?, StockQuantity=?, IsActive=?, UpdatedAt=NOW()
       WHERE VariantID=?`,
      [priceNum, stockNum, IsActive, id]
    );

    // Xóa và ghi lại variant_attribute_values
    await db.query(
      `DELETE FROM variant_attribute_values WHERE VariantID = ?`,
      [id]
    );

    if (attributeValueIds?.length > 0) {
      const values = attributeValueIds.map((valId) => [id, valId]);
      await db.query(
        `INSERT INTO variant_attribute_values (VariantID, AttributeValueID) VALUES ?`,
        [values]
      );
    }

    return { message: "Cập nhật biến thể thành công" };
  } catch (err) {
    console.error("updateVariant error:", err);
    throw err;
  }
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

export const decreaseStockProduct = async (variantId, quantityToReduce) => {
  await db.query(
    `UPDATE product_variants 
     SET StockQuantity = StockQuantity - ? 
     WHERE VariantID = ?`,
    [quantityToReduce, variantId]
  );
};
export const CheckStockProduct = async (variantId) => {
  const [[row]] = await db.query(
    `SELECT StockQuantity FROM product_variants WHERE VariantID = ?`, 
    [variantId]
  );
  return row ? row.StockQuantity : null;
};
