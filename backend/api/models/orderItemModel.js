import db from "../config/db.js";

export const createOrderItemsModel = async (orderId, cart) => {
  for (const item of cart) {
    const totalPrice = item.UnitPrice * item.Quantity;

    await db.query(
      `INSERT INTO order_items
      (OrderID, VariantID, ProductName, Quantity, UnitPrice, TotalPrice)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        item.VariantID,
        item.ProductName,
        item.Quantity,
        item.UnitPrice,
        totalPrice
      ]
    );
  }
};

export const getOrderItemsByOrderId = async (orderId) => {
  const [rows] = await db.query(
    `SELECT * FROM order_items WHERE OrderID = ?`,
    [orderId]
  );
  return rows;
};
