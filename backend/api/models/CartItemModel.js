
import db from "../config/db.js";

export const CartItem = {
  // Lấy toàn bộ item trong cart
  getCartItems: (cartId) => {
    return db.query(
      `SELECT ci.*, v.Price AS VariantPrice 
       FROM cart_items ci
       JOIN variants v ON ci.VariantID = v.VariantID
       WHERE ci.CartID = ?`,
      [cartId]
    );
  },

  // Insert item mới
  addItem: (cartId, variantId, quantity) => {
    return db.query(
      `INSERT INTO cart_items (CartID, VariantID, Quantity, UnitPrice)
       VALUES (?, ?, ?, (SELECT Price FROM variants WHERE VariantID = ?))`,
      [cartId, variantId, quantity, variantId]
    );
  },

  // Tìm item có sẵn
  findItem: (cartId, variantId) => {
    return db.query(
      "SELECT * FROM cart_items WHERE CartID = ? AND VariantID = ?",
      [cartId, variantId]
    );
  },

  // Update quantity
  updateQuantity: (itemId, quantity) => {
    return db.query(
      "UPDATE cart_items SET Quantity = ? WHERE CartItemID = ?",
      [quantity, itemId]
    );
  },

  // Xoá item
  deleteItem: (itemId) => {
    return db.query(
      "DELETE FROM cart_items WHERE CartItemID = ?",
      [itemId]
    );
  },
};
