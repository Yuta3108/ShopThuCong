import db from "../config/db.js";

// Lấy tất cả voucher
export const getAllVouchers = async () => {
  const [rows] = await db.query(`SELECT * FROM vouchers ORDER BY VoucherID DESC`);
  return rows;
};

// Lấy voucher theo ID
export const getVoucherById = async (id) => {
  const [[row]] = await db.query(`SELECT * FROM vouchers WHERE VoucherID = ?`, [id]);
  return row;
};

// Lấy voucher theo Code
export const getVoucherByCode = async (code) => {
  const clean = code.trim().toUpperCase();

  const [[row]] = await db.query(
    `SELECT * FROM vouchers WHERE UPPER(Code) = ? LIMIT 1`,
    [clean]
  );

  return row || null;
};

// Thêm voucher
export const createVoucher = async (data) => {
  const sql = `
    INSERT INTO vouchers 
    (Code, Type, DiscountValue, MinOrder, MaxDiscount, Quantity, StartDate, EndDate, Status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await db.query(sql, [
    data.Code,
    data.Type,
    data.DiscountValue,
    data.MinOrder,
    data.MaxDiscount,
    data.Quantity,
    data.StartDate,
    data.EndDate,
    data.Status,
  ]);

  return result.insertId;
};

// Cập nhật voucher
export const updateVoucher = async (id, data) => {
  await db.query(
    `UPDATE vouchers 
     SET 
       Code = ?, 
       Type = ?, 
       DiscountValue = CAST(? AS DECIMAL(10,2)),
       MinOrder = CAST(? AS DECIMAL(10,2)),
       MaxDiscount = CAST(? AS DECIMAL(10,2)),
       Quantity = CAST(? AS DECIMAL(10,0)),
       StartDate = ?, 
       EndDate = ?, 
       Status = ?
     WHERE VoucherID = ?`,
    [
      data.Code,
      data.Type,
      data.DiscountValue,
      data.MinOrder,
      data.MaxDiscount,
      data.Quantity,
      data.StartDate,
      data.EndDate,
      data.Status,
      id,
    ]
  );
};

// Xóa voucher
export const deleteVoucher = async (id) => {
  await db.query(`DELETE FROM vouchers WHERE VoucherID = ?`, [id]);
};

// Giảm lượt sử dụng
export const decreaseVoucherQuantity = async (id) => {
  await db.query(
    `UPDATE vouchers SET Quantity = Quantity - 1 WHERE VoucherID = ? AND Quantity > 0`,
    [id]
  );
};
