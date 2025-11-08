import db from "../config/db.js";

export const findProducts = async (filters = {}) => {
  const { q, categoryId, isActive, page = 1, pageSize = 50, sort } = filters;
  let conditions = "WHERE 1=1";
  const params = [];

  if (q) { conditions += " AND p.ProductName LIKE ?"; params.push(`%${q}%`); }
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

export const createProduct = async (data) => {
  const { CategoryID, SKU, ProductName, ShortDescription, Material, Description, ImageURL, IsActive } = data;
  const [res] = await db.query(`
    INSERT INTO products 
      (CategoryID, SKU, ProductName, ShortDescription, Material, Description, ImageURL, IsActive, CreatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [CategoryID, SKU, ProductName, ShortDescription, Material, Description, ImageURL, IsActive ?? 1]
  );
  return res.insertId;
};

export const updateProduct = async (id, data) => {
  const { CategoryID, SKU, ProductName, ShortDescription, Material, Description, ImageURL, IsActive } = data;
  const [res] = await db.query(`
    UPDATE products 
    SET CategoryID=?, SKU=?, ProductName=?, ShortDescription=?, 
        Material=?, Description=?, ImageURL=?, IsActive=?, UpdatedAt=NOW()
    WHERE ProductID=?`,
    [CategoryID, SKU, ProductName, ShortDescription, Material, Description, ImageURL, IsActive, id]
  );
  return res.affectedRows > 0;
};

export const deleteProduct = async (id) => {
  const [res] = await db.query(`DELETE FROM products WHERE ProductID = ?`, [id]);
  return res.affectedRows > 0;
};
