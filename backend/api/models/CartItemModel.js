import db from "../config/db.js";

export const CartItem = {
  getItems: (cartId) => {
    return db.query(
      `SELECT 
        ci.CartItemID,
        ci.VariantID,
        ci.Quantity,
        ci.UnitPrice,
        p.ProductName,
        img.ImageURL
      FROM cart_items ci
      JOIN variants v ON v.VariantID = ci.VariantID
      JOIN products p ON p.ProductID = v.ProductID
      LEFT JOIN images img ON img.ProductID = p.ProductID
      WHERE ci.CartID = ?
      GROUP BY ci.CartItemID`,
      [cartId]
    );
  },

  findItem: (cartId, variantId) => {
    return db.query(
      "SELECT * FROM cart_items WHERE CartID = ? AND VariantID = ? LIMIT 1",
      [cartId, variantId]
    );
  },

  addItem: (cartId, variantId, quantity) => {
    return db.query(
      `INSERT INTO cart_items (CartID, VariantID, Quantity, UnitPrice) 
       VALUES (?, ?, ?, (SELECT Price FROM variants WHERE VariantID = ?))`,
      [cartId, variantId, quantity, variantId]
    );
  },

  updateQuantity: (cartItemId, quantity) => {
    return db.query(
      "UPDATE cart_items SET Quantity = ? WHERE CartItemID = ?",
      [quantity, cartItemId]
    );
  },

  removeItem: (cartItemId) => {
    return db.query("DELETE FROM cart_items WHERE CartItemID = ?", [cartItemId]);
  },
};
