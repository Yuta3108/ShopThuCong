import {
  getAllVouchers,
  getVoucherByCode,
  createVoucher,
  decreaseVoucherQuantity,
} from "../models/VoucherModel.js";
import db from "../config/db.js";

// ADMIN: Lấy tất cả voucher
export const getVouchers = async (req, res) => {
  try {
    const vouchers = await getAllVouchers();
    res.json(vouchers);
  } catch (err) {
    console.error("Lỗi getVouchers:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// ADMIN: Tạo voucher
export const createVoucherController = async (req, res) => {
  try {
    const id = await createVoucher(req.body);
    res.status(201).json({ message: "Tạo voucher thành công", VoucherID: id });
  } catch (err) {
    console.error("Lỗi createVoucher:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// ADMIN: SỬA voucher
export const updateVoucherController = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    await db.query(
      `UPDATE vouchers 
       SET Code=?, Type=?, DiscountValue=?, MinOrder=?, MaxDiscount=?, Quantity=?, 
           StartDate=?, EndDate=?, Status=?
       WHERE VoucherID=?`,
      [
        data.Code,
        data.Type,
        data.DiscountValue,
        data.MinOrder || 0,
        data.MaxDiscount || null,
        data.Quantity || 999,
        data.StartDate,
        data.EndDate,
        data.Status ?? 1,
        id,
      ]
    );

    res.json({ message: "Cập nhật voucher thành công" });
  } catch (err) {
    console.error("Lỗi updateVoucher:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

//  ADMIN: XOÁ voucher
export const deleteVoucherController = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM vouchers WHERE VoucherID=?", [id]);

    res.json({ message: "Xoá voucher thành công" });
  } catch (err) {
    console.error("Lỗi deleteVoucher:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

//  USER: ÁP VOUCHER
export const applyVoucher = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code || !subtotal)
      return res.status(400).json({ message: "Thiếu code hoặc subtotal" });

    const voucher = await getVoucherByCode(code.trim());
    if (!voucher || !voucher.Status)
      return res.status(400).json({ message: "Mã giảm giá không hợp lệ" });

    const now = new Date();
    const start = new Date(voucher.StartDate);
    const end = new Date(voucher.EndDate);

    if (now < start || now > end)
      return res.status(400).json({ message: "Mã giảm giá đã hết hạn" });

    if (voucher.Quantity <= 0)
      return res.status(400).json({ message: "Mã giảm giá đã hết lượt dùng" });

    const sub = Number(subtotal);
    if (sub < voucher.MinOrder)
      return res.status(400).json({
        message: `Đơn tối thiểu: ${voucher.MinOrder.toLocaleString()}₫`,
      });

    // Tính giảm giá
    let discount = 0;

    if (voucher.Type === "percent") {
      discount = (sub * voucher.DiscountValue) / 100;
      if (voucher.MaxDiscount)
        discount = Math.min(discount, voucher.MaxDiscount);
    } else {
      discount = voucher.DiscountValue;
    }

    discount = Math.min(discount, sub); // tránh âm tiền

    res.json({
      success: true,
      code: voucher.Code,
      discount,
      finalTotal: sub - discount,
    });

  } catch (err) {
    console.error("Lỗi applyVoucher:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
