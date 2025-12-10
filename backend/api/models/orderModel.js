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
  const [result] = await db.query(
    `UPDATE orders SET Status = ?, UpdatedAt = NOW() WHERE OrderID = ?`,
    [status.toLowerCase(), orderId]
  );

  return result;
};

export const deleteOrderModel = async (orderId) => {
  await db.query(`DELETE FROM order_items WHERE OrderID = ?`, [orderId]);
  await db.query(`DELETE FROM orders WHERE OrderID = ?`, [orderId]);
};
export const getOrderItemsModel = async (orderId) => {
  const [rows] = await db.query(
    "SELECT * FROM order_items WHERE OrderID = ?",
    [orderId]
  );
  return rows;
};

// Hoàn lại tồn kho
export const restoreStockModel = async (items) => {
  for (const item of items) {
    await db.query(
      "UPDATE product_variants SET Stock = Stock + ? WHERE VariantID = ?",
      [item.Quantity, item.VariantID]
    );
  }
};

// Hoàn lại lượt voucher
export const restoreVoucherModel = async (voucherCode) => {
  await db.query(
    "UPDATE voucher SET Stock = Stock + 1 WHERE Voucher = ?",
    [voucherCode]
  );
};

// Model cập nhật trạng thái hủy đơn
export const cancelOrderModel = async (orderId) => {
  const [result] = await db.query(
    "UPDATE orders SET Status = 'cancelled', UpdatedAt = NOW() WHERE OrderID = ?",
    [orderId]
  );
  return result;
};