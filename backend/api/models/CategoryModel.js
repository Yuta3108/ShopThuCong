import db from "../config/db.js";

export const getAllCategories = async () => {
  const [rows] = await db.query(
    `SELECT CategoryID, CategoryName, Slug, Description 
     FROM categories
     ORDER BY CategoryName ASC`
  );
  return rows;
};
