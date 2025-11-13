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