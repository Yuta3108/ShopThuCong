import db from "../config/db.js";

export const createOrderModel = async (data) => {
  const {
    userId,
    receiverName,
    phone,
    email,
    shippingAddress,
    paymentMethod,
    note,
    voucherCode,
    discount,
    total
  } = data;

  const [result] = await db.query(
    `INSERT INTO orders 
    (UserID, ReceiverName, Phone, Email, ShippingAddress, PaymentMethod,
     IsPaid, Total, Status, Note, VoucherCode, Discount, CreatedAt)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?, 'pending', ?, ?, ?, NOW())`,
    [
      userId,
      receiverName,
      phone,
      email,
      shippingAddress,
      paymentMethod,
      total,
      note || null,
      voucherCode || null,
      discount || 0
    ]
  );

  return result.insertId;
};

export const getAllOrdersModel = async () => {
  const [rows] = await db.query(
    `SELECT * FROM orders ORDER BY CreatedAt DESC`
  );
  return rows;
};

export const getOrderDetailModel = async (id) => {
  const [[order]] = await db.query(
    `SELECT * FROM orders WHERE OrderID = ?`,
    [id]
  );
  return order;
};

export const updateOrderStatusModel = async (orderId, status) => {
  await db.query(
    `UPDATE orders SET Status = ?, UpdatedAt = NOW() WHERE OrderID = ?`,
    [status, orderId]
  );
};

export const deleteOrderModel = async (orderId) => {
  await db.query(`DELETE FROM order_items WHERE OrderID = ?`, [orderId]);
  await db.query(`DELETE FROM orders WHERE OrderID = ?`, [orderId]);
};
