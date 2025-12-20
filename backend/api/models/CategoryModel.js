import db from "../config/db.js";

// GET ALL
export const getAllCategories = async () => {
  const [rows] = await db.query(
    `SELECT CategoryID, CategoryName, Slug, Description, ImageURL
     FROM categories
     ORDER BY CategoryName ASC`
  );
  return rows;
};

// GET BY SLUG
export const getCategoryBySlug = async (slug) => {
  const [rows] = await db.query(
    `SELECT CategoryID, CategoryName, Slug, Description, ImageURL
     FROM categories
     WHERE Slug = ?
     LIMIT 1`,
    [slug]
  );
  return rows[0] || null;
};

// GET BY ID (dùng cho xoá ảnh)
export const getCategoryById = async (id) => {
  const [[row]] = await db.query(
    `SELECT CategoryID, ImageURL, ImagePublicID
     FROM categories
     WHERE CategoryID = ?`,
    [id]
  );
  return row || null;
};

// CHECK SLUG TRÙNG
export const checkSlugExist = async (slug, excludeId = null) => {
  let sql = `SELECT CategoryID FROM categories WHERE Slug = ?`;
  const params = [slug];

  if (excludeId) {
    sql += ` AND CategoryID != ?`;
    params.push(excludeId);
  }

  const [rows] = await db.query(sql, params);
  return rows.length > 0;
};

// CREATE
export const createCategory = async (
  name,
  slug,
  description,
  imageUrl,
  imagePublicId
) => {
  const [rs] = await db.query(
    `INSERT INTO categories
     (CategoryName, Slug, Description, ImageURL, ImagePublicID)
     VALUES (?, ?, ?, ?, ?)`,
    [name, slug, description, imageUrl, imagePublicId]
  );
  return rs.insertId;
};

// UPDATE (full)
export const updateCategory = async (
  id,
  name,
  slug,
  description,
  imageUrl,
  imagePublicId
) => {
  const [rs] = await db.query(
    `UPDATE categories
     SET CategoryName = ?, Slug = ?, Description = ?, ImageURL = ?, ImagePublicID = ?
     WHERE CategoryID = ?`,
    [name, slug, description, imageUrl, imagePublicId, id]
  );
  return rs.affectedRows > 0;
};

// XOÁ ẢNH RIÊNG
export const clearCategoryImage = async (id) => {
  const [[row]] = await db.query(
    `SELECT ImagePublicID FROM categories WHERE CategoryID = ?`,
    [id]
  );
  if (!row || !row.ImagePublicID) return null;

  await db.query(
    `UPDATE categories
     SET ImageURL = NULL, ImagePublicID = NULL
     WHERE CategoryID = ?`,
    [id]
  );

  return row.ImagePublicID;
};

// DELETE CATEGORY
export const deleteCategory = async (id) => {
  const [[row]] = await db.query(
    `SELECT ImagePublicID FROM categories WHERE CategoryID = ?`,
    [id]
  );

  await db.query(`DELETE FROM categories WHERE CategoryID = ?`, [id]);
  return row?.ImagePublicID || null;
};
