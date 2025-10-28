import db from "../config/db.js";

/** =========================
 *  PRODUCTS (list + detail)
 *  ========================= */

/** Lấy danh sách sản phẩm với filter + paginate + sort */
export const findProducts = async ({
  q,
  categoryId,
  minPrice,
  maxPrice,
  isActive,
  page = 1,
  pageSize = 12,
  sort = "new", // new | price_asc | price_desc | name_asc | name_desc
}) => {
  const where = [];
  const params = [];

  // Tìm theo tên/SPU
  if (q) {
    where.push("(p.ProductName LIKE ? OR p.SKU LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }

  // Lọc theo danh mục
  if (categoryId) {
    where.push("p.CategoryID = ?");
    params.push(categoryId);
  }

  // Lọc theo trạng thái
  if (typeof isActive === "number") {
    where.push("p.IsActive = ?");
    params.push(isActive);
  }

  // Lọc theo khoảng giá dựa trên variant (giá hiển thị lấy min(Price) của variants)
  if (minPrice != null) {
    where.push("COALESCE(v.minPrice, 0) >= ?");
    params.push(minPrice);
  }
  if (maxPrice != null) {
    where.push("COALESCE(v.minPrice, 0) <= ?");
    params.push(maxPrice);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  // Sắp xếp
  let orderBy = "p.CreatedAt DESC";
  if (sort === "price_asc") orderBy = "v.minPrice ASC";
  if (sort === "price_desc") orderBy = "v.minPrice DESC";
  if (sort === "name_asc") orderBy = "p.ProductName ASC";
  if (sort === "name_desc") orderBy = "p.ProductName DESC";

  // Paginate
  const limit = Number(pageSize);
  const offset = (Number(page) - 1) * limit;

  // Tổng số bản ghi
  const [countRows] = await db.query(
    `
    SELECT COUNT(*) as total
    FROM products p
    LEFT JOIN (
      SELECT ProductID, MIN(Price) AS minPrice, MAX(Price) AS maxPrice
      FROM product_variants
      GROUP BY ProductID
    ) v ON v.ProductID = p.ProductID
    ${whereSql}
  `,
    params
  );
  const total = countRows[0]?.total || 0;

  // Data page
  const [rows] = await db.query(
    `
    SELECT
      p.ProductID, p.CategoryID, p.ProductName, p.SKU,
      p.ShortDescription, p.Material, p.IsActive, p.CreatedAt, p.UpdatedAt,
      c.CategoryName,
      v.minPrice, v.maxPrice,
      img.ImageURL AS Thumbnail
    FROM products p
    LEFT JOIN categories c ON p.CategoryID = c.CategoryID
    LEFT JOIN (
      SELECT ProductID, MIN(Price) AS minPrice, MAX(Price) AS maxPrice
      FROM product_variants GROUP BY ProductID
    ) v ON v.ProductID = p.ProductID
    LEFT JOIN (
      /* Lấy 1 ảnh đại diện từ images qua variant bất kỳ có DisplayOrder nhỏ nhất */
      SELECT i1.VariantID, i1.ImageURL
      FROM images i1
      JOIN (
        SELECT VariantID, MIN(DisplayOrder) AS minDO
        FROM images GROUP BY VariantID
      ) i2 ON i1.VariantID = i2.VariantID AND i1.DisplayOrder = i2.minDO
    ) img ON img.VariantID = (
      SELECT VariantID FROM product_variants pv2
      WHERE pv2.ProductID = p.ProductID
      ORDER BY pv2.VariantID ASC LIMIT 1
    )
    ${whereSql}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `,
    [...params, limit, offset]
  );

  return {
    meta: { page: Number(page), pageSize: Number(pageSize), total, totalPages: Math.ceil(total / limit) },
    data: rows,
  };
};

/** Lấy chi tiết 1 product kèm variants + attributes + images */
export const findProductById = async (productId) => {
  // Thông tin product
  const [pRows] = await db.query(
    `
    SELECT p.*, c.CategoryName
    FROM products p
    LEFT JOIN categories c ON p.CategoryID = c.CategoryID
    WHERE p.ProductID = ?`,
    [productId]
  );
  if (!pRows.length) return null;
  const product = pRows[0];

  // Variants
  const [vRows] = await db.query(
    `
    SELECT VariantID, ProductID, SKU, Price, StockQuantity, Weight, Specification, IsActive, CreatedAt
    FROM product_variants
    WHERE ProductID = ?
    ORDER BY VariantID ASC
  `,
    [productId]
  );

  if (!vRows.length) return { ...product, variants: [] };

  const variantIds = vRows.map((v) => v.VariantID);

  // Images cho tất cả variants
  const [imgRows] = await db.query(
    `
    SELECT ImageID, VariantID, ImageURL, DisplayOrder
    FROM images
    WHERE VariantID IN (${variantIds.map(() => "?").join(",")})
    ORDER BY VariantID, DisplayOrder ASC
  `,
    variantIds
  );

  // Attributes (map: variant -> [{AttributeName, Value}])
  const [attrRows] = await db.query(
    `
    SELECT 
      vav.VariantID,
      a.AttributeName,
      av.Value AS AttributeValue
    FROM variant_attribute_values vav
    JOIN attribute_values av ON av.AttributeValueID = vav.AttributeValueID
    JOIN attributes a ON a.AttributeID = av.AttributeID
    WHERE vav.VariantID IN (${variantIds.map(() => "?").join(",")})
    ORDER BY vav.VariantID, a.AttributeName
  `,
    variantIds
  );

  // Gom nhóm ảnh + thuộc tính theo variant
  const imagesByVariant = new Map();
  imgRows.forEach((i) => {
    if (!imagesByVariant.has(i.VariantID)) imagesByVariant.set(i.VariantID, []);
    imagesByVariant.get(i.VariantID).push(i);
  });

  const attrsByVariant = new Map();
  attrRows.forEach((r) => {
    if (!attrsByVariant.has(r.VariantID)) attrsByVariant.set(r.VariantID, []);
    attrsByVariant.get(r.VariantID).push({ AttributeName: r.AttributeName, AttributeValue: r.AttributeValue });
  });

  const variants = vRows.map((v) => ({
    ...v,
    images: imagesByVariant.get(v.VariantID) || [],
    attributes: attrsByVariant.get(v.VariantID) || [],
  }));

  return { ...product, variants };
};

/** =========================
 *  MUTATIONS (product/variant)
 *  ========================= */

export const createProduct = async ({
  CategoryID,
  SKU,
  ProductName,
  ShortDescription,
  Material,
  Description,
  IsActive = 1,
}) => {
  const [rs] = await db.query(
    `INSERT INTO products (CategoryID, SKU, ProductName, ShortDescription, Material, Description, IsActive, CreatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
    [CategoryID, SKU, ProductName, ShortDescription, Material, Description, IsActive]
  );
  return rs.insertId;
};

export const updateProduct = async (ProductID, payload) => {
  const fields = [];
  const params = [];
  const allow = ["CategoryID", "SKU", "ProductName", "ShortDescription", "Material", "Description", "IsActive"];

  allow.forEach((k) => {
    if (payload[k] !== undefined) {
      fields.push(`${k} = ?`);
      params.push(payload[k]);
    }
  });

  if (!fields.length) return 0;

  params.push(ProductID);
  const [rs] = await db.query(
    `UPDATE products SET ${fields.join(", ")}, UpdatedAt = NOW() WHERE ProductID = ?`,
    params
  );
  return rs.affectedRows;
};

export const deleteProduct = async (ProductID) => {
  // Có thể bật ON DELETE CASCADE ở FK; nếu chưa có thì xóa tay theo thứ tự
  // Xóa mapping thuộc tính -> ảnh -> variants -> product
  await db.query(
    `DELETE vav FROM variant_attribute_values vav 
     JOIN product_variants pv ON pv.VariantID = vav.VariantID 
     WHERE pv.ProductID = ?`,
    [ProductID]
  );
  await db.query(
    `DELETE i FROM images i 
     JOIN product_variants pv ON pv.VariantID = i.VariantID 
     WHERE pv.ProductID = ?`,
    [ProductID]
  );
  await db.query(`DELETE FROM product_variants WHERE ProductID = ?`, [ProductID]);
  const [rs] = await db.query(`DELETE FROM products WHERE ProductID = ?`, [ProductID]);
  return rs.affectedRows;
};

/** ===== Variants ===== */

export const createVariant = async ({ ProductID, SKU, Price, StockQuantity = 0, Weight = null, Specification = null, IsActive = 1 }) => {
  const [rs] = await db.query(
    `INSERT INTO product_variants (ProductID, SKU, Price, StockQuantity, Weight, Specification, IsActive, CreatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
    [ProductID, SKU, Price, StockQuantity, Weight, Specification, IsActive]
  );
  return rs.insertId;
};

export const updateVariant = async (VariantID, payload) => {
  const allow = ["SKU", "Price", "StockQuantity", "Weight", "Specification", "IsActive"];
  const sets = [];
  const params = [];
  allow.forEach((k) => {
    if (payload[k] !== undefined) {
      sets.push(`${k} = ?`);
      params.push(payload[k]);
    }
  });
  if (!sets.length) return 0;
  params.push(VariantID);
  const [rs] = await db.query(
    `UPDATE product_variants SET ${sets.join(", ")}, CreatedAt = CreatedAt WHERE VariantID = ?`,
    params
  );
  return rs.affectedRows;
};

export const deleteVariant = async (VariantID) => {
  await db.query(`DELETE FROM variant_attribute_values WHERE VariantID = ?`, [VariantID]);
  await db.query(`DELETE FROM images WHERE VariantID = ?`, [VariantID]);
  const [rs] = await db.query(`DELETE FROM product_variants WHERE VariantID = ?`, [VariantID]);
  return rs.affectedRows;
};

/** ===== Images ===== */

export const addVariantImage = async ({ VariantID, ImageURL, DisplayOrder = 1 }) => {
  const [rs] = await db.query(
    `INSERT INTO images (VariantID, ImageURL, DisplayOrder)
     VALUES (?, ?, ?)`,
    [VariantID, ImageURL, DisplayOrder]
  );
  return rs.insertId;
};

export const deleteImage = async (ImageID) => {
  const [rs] = await db.query(`DELETE FROM images WHERE ImageID = ?`, [ImageID]);
  return rs.affectedRows;
};

export const setVariantAttributes = async (VariantID, attributeValueIds = []) => {
  // Xóa cũ
  await db.query(`DELETE FROM variant_attribute_values WHERE VariantID = ?`, [VariantID]);
  // Thêm mới
  if (!attributeValueIds.length) return 0;

  const values = attributeValueIds.map((id) => [VariantID, id]);
  const [rs] = await db.query(
    `INSERT INTO variant_attribute_values (VariantID, AttributeValueID) VALUES ?`,
    [values]
  );
  return rs.affectedRows;
};
