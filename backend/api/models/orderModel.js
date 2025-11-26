import db from "../config/db.js";

export const createOrderModel = async (data) => {
  const {
    userId,
    receiverName,
    phone,
    Email,
    shippingAddress,
    paymentMethod,
    note,
    voucherCode,
    discount,
    total
  } = data;

  const [result] = await db.query(
    `INSERT INTO orders 
    (UserID, ReceiverName, Phone,Email, ShippingAddress, PaymentMethod, 
     IsPaid, Total, Status, Note, VoucherCode, Discount, CreatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      userId,
      receiverName,
      phone,
      Email,
      shippingAddress,
      paymentMethod,
      0,
      total,
      "pending",
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
