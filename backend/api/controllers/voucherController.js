import {
  getAllVouchers,
  getVoucherById,
  getVoucherByCode,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  lockVoucherIfNeeded,
} from "../models/VoucherModel.js";

/* ------------------------- HELPERS ------------------------- */

const toNumber = (val, fallback = 0) => {
  if (val === undefined || val === null || val === "") return fallback;

  if (typeof val === "string") {
    val = val.replace(/\./g, "").replace(",", ".");
  }

  const n = Number(val);
  return Number.isNaN(n) ? fallback : n;
};

const normalizeDate = (val) => {
  if (!val) return null;

  if (val.includes("/")) {
    const [d, m, y] = val.split("/");
    return `${y}-${m}-${d}`;
  }

  if (val.includes("T")) return val.slice(0, 10);

  return val;
};

/* ------------------------- GET ALL ------------------------- */

export const getVouchersController = async (req, res) => {
  try {
    const rows = await getAllVouchers();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ------------------------- CREATE ------------------------- */

export const createVoucherController = async (req, res) => {
  try {
    const d = req.body;

    const payload = {
      Code: d.Code.trim(),
      Type: d.Type,
      DiscountValue: toNumber(d.DiscountValue),
      MinOrder: toNumber(d.MinOrder),
      MaxDiscount: d.Type === "fixed" ? 0 : toNumber(d.MaxDiscount),
      Quantity: toNumber(d.Quantity),
      StartDate: normalizeDate(d.StartDate),
      EndDate: normalizeDate(d.EndDate),
      Status: d.Status ? 1 : 0,
    };

    const id = await createVoucher(payload);
    res.json({ VoucherID: id, ...payload });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ------------------------- UPDATE ------------------------- */

export const updateVoucherController = async (req, res) => {
  try {
    const id = req.params.id;
    const d = req.body;

    const payload = {
      Code: d.Code?.trim(),
      Type: d.Type,
      DiscountValue: toNumber(d.DiscountValue),
      MinOrder: toNumber(d.MinOrder),
      MaxDiscount: d.Type === "fixed" ? 0 : toNumber(d.MaxDiscount),
      Quantity: toNumber(d.Quantity),
      StartDate: normalizeDate(d.StartDate),
      EndDate: normalizeDate(d.EndDate),
      Status: d.Status === 0 || d.Status === "0" ? 0 : 1,
    };

    // Kiểm tra trùng mã
    const existed = await getVoucherByCode(payload.Code);
    if (existed && existed.VoucherID != id) {
      return res.status(400).json({ message: "Mã voucher đã tồn tại" });
    }

    await updateVoucher(id, payload);
    res.json({ message: "Cập nhật thành công" });

  } catch (err) {
    console.log("Lỗi updateVoucher:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ------------------------- DELETE ------------------------- */

export const deleteVoucherController = async (req, res) => {
  try {
    await deleteVoucher(req.params.id);
    res.json({ message: "Xóa thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ------------------------- APPLY (USER) ------------------------- */

export const applyVoucherController = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    const voucher = await getVoucherByCode(code);
    if (!voucher) {
      return res.status(400).json({ success: false, message: "Mã voucher không tồn tại!" });
    }

    // Voucher bị khóa
    if (Number(voucher.Status) === 0) {
      return res.status(400).json({ success: false, message: "Voucher đã bị khóa hoặc hết lượt!" });
    }

    // Voucher hết lượt
    if (Number(voucher.Quantity) <= 0) {
      await lockVoucherIfNeeded(voucher.VoucherID);
      return res.status(400).json({ success: false, message: "Voucher đã hết lượt sử dụng!" });
    }

    // Chưa đạt giá trị tối thiểu
    if (subtotal < voucher.MinOrder) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng chưa đạt ${voucher.MinOrder.toLocaleString()}₫ để áp dụng`,
      });
    }

    // Tính giảm
    let discount = voucher.Type === "percent"
      ? (subtotal * voucher.DiscountValue) / 100
      : Number(voucher.DiscountValue);

    if (discount > voucher.MaxDiscount) {
      discount = voucher.MaxDiscount;
    }
    return res.json({
      success: true,
      discount,
      message: "Áp dụng voucher thành công!"
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
};
