import db from "../config/db.js";

export const findProducts = async (filters = {}) => {
  const {
    q, categoryId, minPrice, maxPrice,
    isActive, page = 1, pageSize = 50, sort,
  } = filters;

  let conditions = "WHERE 1=1";
  const params = [];

  if (q) { conditions += " AND p.ProductName LIKE ?"; params.push(`%${q}%`); }
  if (categoryId) { conditions += " AND p.CategoryID = ?"; params.push(categoryId); }
  if (isActive !== undefined) { conditions += " AND p.IsActive = ?"; params.push(isActive); }

  const offset = (page - 1) * pageSize;
  const order = sort ? `ORDER BY ${sort}` : "ORDER BY p.CreatedAt DESC";

  const [rows] = await db.query(`
    SELECT 
      p.ProductID, p.SKU, p.ProductName, p.ShortDescription,
      p.Material, p.Description, p.IsActive, p.CategoryID,
      c.CategoryName,
      MIN(v.Price) AS minPrice,
      MAX(v.Price) AS maxPrice,
      (
        SELECT i.ImageURL 
        FROM images i 
        JOIN product_variants vv ON vv.VariantID = i.VariantID
        WHERE vv.ProductID = p.ProductID
        ORDER BY i.DisplayOrder ASC, i.ImageID ASC
        LIMIT 1
      ) AS cover
    FROM products p
    LEFT JOIN categories c ON c.CategoryID = p.CategoryID
    LEFT JOIN product_variants v ON v.ProductID = p.ProductID
    ${conditions}
    GROUP BY p.ProductID
    ${order}
    LIMIT ? OFFSET ?`, [...params, Number(pageSize), Number(offset)]
  );

  return rows;
};


export const findProductById = async (id) => {
  const [[product]] = await db.query(`
    SELECT p.*, c.CategoryName,
      MIN(v.Price) AS minPrice, MAX(v.Price) AS maxPrice
    FROM products p
    LEFT JOIN categories c ON c.CategoryID = p.CategoryID
    LEFT JOIN product_variants v ON v.ProductID = p.ProductID
    WHERE p.ProductID = ? GROUP BY p.ProductID`, [id]
  );
  if (!product) return null;

  const [variants] = await db.query(
    `SELECT * FROM product_variants WHERE ProductID = ? ORDER BY CreatedAt ASC`, [id]
  );

  for (const v of variants) {
    const [images] = await db.query(
      `SELECT ImageID, VariantID, ImageURL, DisplayOrder FROM images WHERE VariantID = ? ORDER BY DisplayOrder ASC`, [v.VariantID]
    );
    const [attrs] = await db.query(
      `SELECT a.AttributeName, av.Value
       FROM variant_attribute_values va
       JOIN attribute_values av ON va.AttributeValueID = av.AttributeValueID
       JOIN attributes a ON av.AttributeID = a.AttributeID
       WHERE va.VariantID = ?`, [v.VariantID]
    );
    v.images = images;
    v.attributes = attrs;
  }
  product.variants = variants;
  return product;
};

export const createProduct = async (data) => {
  const { CategoryID, SKU, ProductName, ShortDescription, Material, Description, IsActive } = data;
  const [result] = await db.query(`
    INSERT INTO products (CategoryID, SKU, ProductName, ShortDescription, Material, Description, IsActive, CreatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
    [CategoryID, SKU, ProductName, ShortDescription, Material, Description, IsActive ?? 1]
  );
  return result.insertId;
};

export const updateProduct = async (id, data) => {
  const { CategoryID, SKU, ProductName, ShortDescription, Material, Description, IsActive } = data;
  const [res] = await db.query(`
    UPDATE products SET CategoryID=?, SKU=?, ProductName=?, ShortDescription=?, Material=?, Description=?, IsActive=?, UpdatedAt=NOW()
    WHERE ProductID=?`,
    [CategoryID, SKU, ProductName, ShortDescription, Material, Description, IsActive, id]
  );
  return res.affectedRows > 0;
};

export const deleteProduct = async (id) => {
  const [res] = await db.query(`DELETE FROM products WHERE ProductID = ?`, [id]);
  return res.affectedRows > 0;
};

/* ========================= VARIANTS ========================= */
export const createVariant = async ({
  ProductID,
  SKU,
  Price,
  StockQuantity = 0,
  Weight = null,
  IsActive = 1,
  attributeValueIds = [],
}) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Tự động tạo SKU nếu không có
    let finalSKU = SKU?.trim();
    if (!finalSKU) {
      // Lấy SKU gốc của sản phẩm
      const [[product]] = await conn.query(
        "SELECT SKU FROM products WHERE ProductID = ?",
        [ProductID]
      );

      if (product && product.SKU) {
        // Đếm xem sản phẩm này đã có bao nhiêu biến thể
        const [[countRes]] = await conn.query(
          "SELECT COUNT(*) AS count FROM product_variants WHERE ProductID = ?",
          [ProductID]
        );
        const index = countRes.count + 1;
        finalSKU = `${product.SKU}-${index}`; // ví dụ: PKTB-001-1
      } else {
        // fallback nếu product chưa có SKU
        finalSKU = `P${ProductID}-${Date.now().toString().slice(-4)}`;
      }
    }

    // Kiểm tra SKU trùng
    const [[exists]] = await conn.query(
      "SELECT VariantID FROM product_variants WHERE SKU = ?",
      [finalSKU]
    );
    if (exists)
      throw new Error(`SKU '${finalSKU}' đã tồn tại, vui lòng chọn SKU khác.`);

    // Tạo biến thể
    const [variantRes] = await conn.query(
      `INSERT INTO product_variants 
       (ProductID, SKU, Price, StockQuantity, Weight, IsActive, CreatedAt)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [ProductID, finalSKU, Price, StockQuantity, Weight, IsActive]
    );
    const VariantID = variantRes.insertId;

    // Gán thuộc tính (lọc trùng & tránh lỗi duplicate)
    if (Array.isArray(attributeValueIds) && attributeValueIds.length > 0) {
      const uniqueIds = [...new Set(attributeValueIds)];
      const values = uniqueIds.map((v) => [VariantID, v]);
      await conn.query(
        "INSERT IGNORE INTO variant_attribute_values (VariantID, AttributeValueID) VALUES ?",
        [values]
      );
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
  const uniqueIds = [...new Set(attributeValueIds)];
  if (uniqueIds.length > 0) {
    const values = uniqueIds.map((val) => [id, val]);
    await db.query(
      `INSERT IGNORE INTO variant_attribute_values (VariantID, AttributeValueID) VALUES ?`, [values]
    );
  }

  return res.affectedRows > 0;
};

export const deleteVariant = async (id) => {
  const [res] = await db.query(`DELETE FROM product_variants WHERE VariantID = ?`, [id]);
  return res.affectedRows > 0;
};

/* ========================= IMAGES ========================= */
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

/* ========================= ATTRIBUTES ========================= */
export const setVariantAttributes = async (variantId, attributeValueIds = []) => {
  await db.query(`DELETE FROM variant_attribute_values WHERE VariantID = ?`, [variantId]);
  const uniqueIds = [...new Set(attributeValueIds)];
  if (!uniqueIds.length) return;
  const values = uniqueIds.map((v) => [variantId, v]);
  await db.query(
    `INSERT IGNORE INTO variant_attribute_values (VariantID, AttributeValueID) VALUES ?`, [values]
  );
};
