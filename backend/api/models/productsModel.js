import db from "../config/db.js";

/* ----------------------------- PRODUCTS ----------------------------- */
export const findProducts = async (filters = {}) => {
  const {
    q, categoryId, minPrice, maxPrice,
    isActive, page = 1, pageSize = 50, sort,
  } = filters;

  let conditions = "WHERE 1=1";
  const params = [];

  if (q) {
    conditions += " AND p.ProductName LIKE ?";
    params.push(`%${q}%`);
  }
  if (categoryId) {
    conditions += " AND p.CategoryID = ?";
    params.push(categoryId);
  }
  if (isActive !== undefined) {
    conditions += " AND p.IsActive = ?";
    params.push(isActive);
  }

  const offset = (page - 1) * pageSize;
  const order = sort ? `ORDER BY ${sort}` : "ORDER BY p.CreatedAt DESC";

  const [rows] = await db.query(
    `
    SELECT DISTINCT
      p.ProductID, p.ProductName, p.SKU, p.CategoryID, p.ShortDescription,
      p.Material, p.IsActive, p.CreatedAt, p.UpdatedAt,
      c.CategoryName,
      MIN(v.Price) AS minPrice, MAX(v.Price) AS maxPrice
    FROM products p
    LEFT JOIN categories c ON c.CategoryID = p.CategoryID
    LEFT JOIN product_variants v ON v.ProductID = p.ProductID
    ${conditions}
    GROUP BY p.ProductID
    ${order}
    LIMIT ? OFFSET ?
    `,
    [...params, Number(pageSize), Number(offset)]
  );

  return rows;
};

export const findProductById = async (id) => {
  const [[product]] = await db.query(
    `
    SELECT
      p.*, c.CategoryName,
      MIN(v.Price) AS minPrice, MAX(v.Price) AS maxPrice
    FROM products p
    LEFT JOIN categories c ON c.CategoryID = p.CategoryID
    LEFT JOIN product_variants v ON v.ProductID = p.ProductID
    WHERE p.ProductID = ?
    GROUP BY p.ProductID
    `,
    [id]
  );
  if (!product) return null;

  const [variants] = await db.query(
    `SELECT * FROM product_variants WHERE ProductID = ? ORDER BY CreatedAt ASC`,
    [id]
  );

  for (const v of variants) {
    const [images] = await db.query(
      `SELECT ImageID, VariantID, ImageURL, DisplayOrder FROM images WHERE VariantID = ? ORDER BY DisplayOrder ASC`,
      [v.VariantID]
    );
    v.images = images;
  }

  product.variants = variants;
  return product;
};

export const createProduct = async (data) => {
  const { CategoryID, SKU, ProductName, ShortDescription, Material, Description, IsActive } = data;
  const [result] = await db.query(
    `INSERT INTO products (CategoryID, SKU, ProductName, ShortDescription, Material, Description, IsActive, CreatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
    [CategoryID, SKU, ProductName, ShortDescription, Material, Description, IsActive ?? 1]
  );
  return result.insertId;
};

export const updateProduct = async (id, data) => {
  const { CategoryID, SKU, ProductName, ShortDescription, Material, Description, IsActive } = data;
  const [res] = await db.query(
    `UPDATE products
     SET CategoryID=?, SKU=?, ProductName=?, ShortDescription=?, Material=?, Description=?, IsActive=?, UpdatedAt=NOW()
     WHERE ProductID=?`,
    [CategoryID, SKU, ProductName, ShortDescription, Material, Description, IsActive, id]
  );
  return res.affectedRows > 0;
};

export const deleteProduct = async (id) => {
  const [res] = await db.query(`DELETE FROM products WHERE ProductID = ?`, [id]);
  return res.affectedRows > 0;
};

/* ----------------------------- VARIANTS ----------------------------- */
export const createVariant = async ({
  ProductID, SKU, Price, StockQuantity = 0, Weight = null,
  Specification = null, IsActive = 1,
}) => {
  const [res] = await db.query(
    `INSERT INTO product_variants
     (ProductID, SKU, Price, StockQuantity, Weight, Specification, IsActive, CreatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
    [ProductID, SKU, Price, StockQuantity, Weight, Specification, IsActive]
  );
  return res.insertId;
};

export const updateVariant = async (id, data) => {
  const { Price, StockQuantity, Specification, IsActive } = data;
  const [res] = await db.query(
    `UPDATE product_variants
     SET Price=?, StockQuantity=?, Specification=?, IsActive=?, UpdatedAt=NOW()
     WHERE VariantID=?`,
    [Price, StockQuantity, Specification, IsActive, id]
  );
  return res.affectedRows > 0;
};

export const deleteVariant = async (id) => {
  const [res] = await db.query(`DELETE FROM product_variants WHERE VariantID = ?`, [id]);
  return res.affectedRows > 0;
};

/* ------------------------------ IMAGES ------------------------------ */
export const addVariantImage = async ({ VariantID, ImageURL, PublicID, DisplayOrder = 1 }) => {
  const [res] = await db.query(
    `INSERT INTO images (VariantID, ImageURL, PublicID, DisplayOrder)
     VALUES (?, ?, ?, ?)`,
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

/* ---------------------------- ATTRIBUTES ---------------------------- */
export const setVariantAttributes = async (variantId, attributeValueIds = []) => {
  await db.query(`DELETE FROM variant_attributes WHERE VariantID = ?`, [variantId]);
  if (!attributeValueIds.length) return;
  const values = attributeValueIds.map((v) => [variantId, v]);
  await db.query(`INSERT INTO variant_attributes (VariantID, AttributeValueID) VALUES ?`, [values]);
};
