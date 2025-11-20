
import db from "../config/db.js";
// Lấy toàn bộ voucher (cho admin)
export const getAllVouchers = async () => {
  const [rows] = await db.query("SELECT * FROM vouchers ORDER BY VoucherID DESC");
  return rows;
};

// Lấy voucher theo code
export const getVoucherByCode = async (code) => {
  const [rows] = await db.query(
    "SELECT * FROM vouchers WHERE Code = ? LIMIT 1",
    [code]
  );
  return rows[0] || null;
};

// Tạo voucher mới 
export const createVoucher = async (voucher) => {
  const {
    Code,
    Type,
    DiscountValue,
    MinOrder,
    MaxDiscount,
    Quantity,
    StartDate,
    EndDate,
    Status,
  } = voucher;

  const [result] = await db.query(
    `INSERT INTO vouchers 
     (Code, Type, DiscountValue, MinOrder, MaxDiscount, Quantity, StartDate, EndDate, Status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      Code,
      Type,
      DiscountValue,
      MinOrder || 0,
      MaxDiscount || null,
      Quantity || 999,
      StartDate,
      EndDate,
      Status ?? 1,
    ]
  );

  return result.insertId;
};

// Giảm số lượng sau khi dùng (tuỳ vợ muốn gọi khi nào)
export const decreaseVoucherQuantity = async (voucherId) => {
  await db.query(
    "UPDATE vouchers SET Quantity = Quantity - 1 WHERE VoucherID = ? AND Quantity > 0",
    [voucherId]
  );
};
