import db from "../config/db.js";

export const getAllCategories = async () => {
  const [rows] = await db.query(
    `SELECT CategoryID, CategoryName, Slug, Description 
     FROM categories
     ORDER BY CategoryName ASC`
  );
  return rows;
};

export const getCategoryBySlug = async (slug) => {
  const [rows] = await db.query(
    `SELECT CategoryID, CategoryName, Slug, Description
     FROM categories
     WHERE Slug = ?
     LIMIT 1`,
    [slug]
  );
  return rows[0] || null;
};

export const createCategory = async (name, slug, description) => {
  const [result] = await db.query(
    `INSERT INTO categories (CategoryName, Slug, Description)
     VALUES (?, ?, ?)`,
    [name, slug, description]
  );
  return result.insertId;
};

export const updateCategory = async (id, name, slug, description) => {
  const [result] = await db.query(
    `UPDATE categories
     SET CategoryName = ?, Slug = ?, Description = ?
     WHERE CategoryID = ?`,
    [name, slug, description, id]
  );
  return result.affectedRows > 0;
};
export const deleteCategory = async (id) => {
  const [result] = await db.query(
    `DELETE FROM categories WHERE CategoryID = ?`,
    [id]
  );
  return result.affectedRows > 0;
};
