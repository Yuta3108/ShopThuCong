import db from "../config/db.js";

export const CartItem = {
  // Lấy toàn bộ item trong giỏ
  getCartItems: (cartId) => {
    return db.query(
      `SELECT 
          ci.*,
          pv.Price AS VariantPrice,
          pv.ProductID,
          pv.ProductCode,
          p.ProductName,
          img.ImageURL
       FROM cart_items ci
       JOIN product_variants pv ON ci.VariantID = pv.VariantID
       JOIN products p ON pv.ProductID = p.ProductID
       LEFT JOIN images img 
            ON img.VariantID = pv.VariantID
           AND img.DisplayOrder = 1
       WHERE ci.CartID = ?`,
      [cartId]
    );
  },

  // Thêm item
  addItem: (cartId, variantId, quantity) => {
    return db.query(
      `INSERT INTO cart_items (CartID, VariantID, Quantity, UnitPrice)
       VALUES (?, ?, ?, (SELECT Price FROM product_variants WHERE VariantID = ?))`,
      [cartId, variantId, quantity, variantId]
    );
  },

  // Kiểm tra đã có trong giỏ chưa
  findItem: (cartId, variantId) => {
    return db.query(
      "SELECT * FROM cart_items WHERE CartID = ? AND VariantID = ?",
      [cartId, variantId]
    );
  },

  // Cập nhật số lượng
  updateQuantity: (itemId, quantity) => {
    return db.query(
      "UPDATE cart_items SET Quantity = ? WHERE CartItemID = ?",
      [quantity, itemId]
    );
  },

  // Xóa item
  deleteItem: (itemId) => {
    return db.query(
      "DELETE FROM cart_items WHERE CartItemID = ?",
      [itemId]
    );
  },
};
