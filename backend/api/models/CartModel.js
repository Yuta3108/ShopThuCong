import db from "../config/db.js";

export const Cart = {
  getCartByUserId: (userId) => {
    return db.query("SELECT * FROM carts WHERE UserID = ? LIMIT 1", [userId]);
  },

  createCart: (userId) => {
    return db.query("INSERT INTO carts (UserID) VALUES (?)", [userId]);
  },
};
