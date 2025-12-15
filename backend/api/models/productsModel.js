import db from "../config/db.js";

export const findProducts = async (filters = {}) => {
  const { q, categoryId, isActive, page = 1, pageSize = 50, sort } = filters;
  let conditions = "WHERE 1=1";
  const params = [];

  if (q) {
  const keywords = q.split(" ").filter(Boolean);
  keywords.forEach(() => {
    conditions += " AND p.ProductName LIKE ?";
  });
  keywords.forEach(k => params.push(`%${k}%`));
}
  if (categoryId) { conditions += " AND p.CategoryID = ?"; params.push(categoryId); }
  if (isActive !== undefined) { conditions += " AND p.IsActive = ?"; params.push(isActive); }

  const offset = (page - 1) * pageSize;
  const order = sort ? `ORDER BY ${sort}` : "ORDER BY p.CreatedAt DESC";

  const [rows] = await db.query(`
    SELECT p.*, c.CategoryName,
      MIN(v.Price) AS minPrice, MAX(v.Price) AS maxPrice
    FROM products p
    LEFT JOIN categories c ON c.CategoryID = p.CategoryID
    LEFT JOIN product_variants v ON v.ProductID = p.ProductID
    ${conditions}
    GROUP BY p.ProductID
    ${order}
    LIMIT ? OFFSET ?`,
    [...params, Number(pageSize), Number(offset)]
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
  return product || null;
};
export const findProductDetailById = async (productId) => {
  // Lấy sản phẩm chính
  const [[product]] = await db.query(`
    SELECT p.*, c.CategoryName,
           MIN(v.Price) AS minPrice, MAX(v.Price) AS maxPrice
    FROM products p
    LEFT JOIN categories c ON p.CategoryID = c.CategoryID
    LEFT JOIN product_variants v ON v.ProductID = p.ProductID
    WHERE p.ProductID = ?
    GROUP BY p.ProductID
  `, [productId]);

  if (!product) return null;

  // Lấy danh sách biến thể
  const [variants] = await db.query(
    `SELECT * FROM product_variants WHERE ProductID = ?`,
    [productId]
  );

  // Với mỗi biến thể: lấy ảnh + thuộc tính
  for (const v of variants) {
    const [images] = await db.query(
      `SELECT ImageID, ImageURL FROM images WHERE VariantID = ?`,
      [v.VariantID]
    );

    // Lấy thuộc tính & giá trị 
    const [attributes] = await db.query(`
      SELECT a.AttributeID, a.AttributeName, av.AttributeValueID, av.Value
      FROM variant_attribute_values vav
      JOIN attribute_values av ON vav.AttributeValueID = av.AttributeValueID
      JOIN attributes a ON av.AttributeID = a.AttributeID
      WHERE vav.VariantID = ?
    `, [v.VariantID]);

    v.images = images;
    v.attributes = attributes; 
  }

  product.variants = variants;
  return product;
};
// Tìm sản phẩm theo category slug và product code
export const findProductDetailBySlugAndCode = async (categorySlug, productCode) => {
  // Lấy sản phẩm chính
  const [[product]] = await db.query(`
    SELECT p.*, c.CategoryName, c.Slug AS CategorySlug,
           MIN(v.Price) AS minPrice, MAX(v.Price) AS maxPrice
    FROM products p
    JOIN categories c ON p.CategoryID = c.CategoryID
    LEFT JOIN product_variants v ON v.ProductID = p.ProductID
    WHERE c.Slug = ? AND p.ProductCode = ?
    GROUP BY p.ProductID
  `, [categorySlug, productCode]);

  if (!product) return null;

  // Lấy variants
  const [variants] = await db.query(
    `SELECT * FROM product_variants WHERE ProductID = ?`,
    [product.ProductID]
  );

  //  Lấy images + attributes cho từng variant
  for (const v of variants) {
    const [images] = await db.query(
      `SELECT ImageID, ImageURL FROM images WHERE VariantID = ?`,
      [v.VariantID]
    );

    const [attributes] = await db.query(`
      SELECT a.AttributeID, a.AttributeName,
             av.AttributeValueID, av.Value
      FROM variant_attribute_values vav
      JOIN attribute_values av ON vav.AttributeValueID = av.AttributeValueID
      JOIN attributes a ON av.AttributeID = a.AttributeID
      WHERE vav.VariantID = ?
    `, [v.VariantID]);

    v.images = images;
    v.attributes = attributes;
  }

  product.variants = variants;
  return product;
};

export const createProduct = async (data) => {
  const { CategoryID, ProductCode, ProductName, ShortDescription, Material, Description, ImageURL, IsActive } = data;
  const [res] = await db.query(`
    INSERT INTO products 
      (CategoryID, ProductCode, ProductName, ShortDescription, Material, Description, ImageURL, IsActive, CreatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [CategoryID, ProductCode, ProductName, ShortDescription, Material, Description, ImageURL, IsActive ?? 1]
  );
  return res.insertId;
};

export const updateProduct = async (id, data) => {
  const { CategoryID, ProductCode, ProductName, ShortDescription, Material, Description, ImageURL, IsActive } = data;
  const [res] = await db.query(`
    UPDATE products 
    SET CategoryID=?, ProductCode=?, ProductName=?, ShortDescription=?, 
        Material=?, Description=?, ImageURL=?, IsActive=?, UpdatedAt=NOW()
    WHERE ProductID=?`,
    [CategoryID, ProductCode, ProductName, ShortDescription, Material, Description, ImageURL, IsActive, id]
  );
  return res.affectedRows > 0;
};

export const deleteProduct = async (id) => {
  const [res] = await db.query(`DELETE FROM products WHERE ProductID = ?`, [id]);
  return res.affectedRows > 0;
};

export const autoDeactivateProductIfOutOfStock = async (productId) => {
  const [[row]] = await db.query(
    `SELECT SUM(StockQuantity) AS totalStock 
     FROM product_variants 
     WHERE ProductID = ?`,
    [productId]
  );

  if (!row?.totalStock || row.totalStock <= 0) {
    await db.query(
      `UPDATE products 
       SET IsActive = 0 
       WHERE ProductID = ?`,
      [productId]
    );
  }
};
