import {
  getAllVouchers,
  getVoucherById,
  getVoucherByCode,
  createVoucher,
  updateVoucher,
  deleteVoucher,
} from "../models/VoucherModel.js";

// ==== Helper convert số an toàn ====
const toNumber = (val, fallback = 0) => {
  if (val === undefined || val === null || val === "") return fallback;

  // "20.000,00" → "20000.00"
  if (typeof val === "string") {
    val = val.replace(/\./g, "").replace(",", ".");
  }

  const n = Number(val);
  return Number.isNaN(n) ? fallback : n;
};

// ==== Helper chuẩn hóa ngày về MySQL YYYY-MM-DD ====
const normalizeDate = (val) => {
  if (!val) return null;

  // "31/12/2025" -> "2025-12-31"
  if (val.includes("/")) {
    const [d, m, y] = val.split("/");
    return `${y}-${m}-${d}`;
  }

  // "2025-12-31T00:00:00.000Z"
  if (val.includes("T")) return val.slice(0, 10);

  return val; // đã đúng yyyy-mm-dd
};

// ==== GET ALL ====
export const getVouchersController = async (req, res) => {
  try {
    const rows = await getAllVouchers();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==== CREATE ====
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

// ==== UPDATE ====
export const updateVoucherController = async (req, res) => {
  try {
    const id = req.params.id;
    const d = req.body;

    const toNumber = (v, fb = 0) => {
      if (v === undefined || v === null || v === "") return fb;
      if (typeof v === "string") v = v.replace(/\./g, "").replace(",", ".");
      const n = Number(v);
      return Number.isNaN(n) ? fb : n;
    };

    const normalizeDate = (val) => {
      if (!val) return null;
      if (val.includes("/")) {
        const [dd, mm, yy] = val.split("/");
        return `${yy}-${mm}-${dd}`;
      }
      if (val.includes("T")) return val.slice(0, 10);
      return val;
    };

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

    // KIỂM TRA TRÙNG MÃ
    const existed = await getVoucherByCode(payload.Code);
    if (existed && existed.VoucherID != id) {
      return res.status(400).json({
        message: "Mã voucher đã tồn tại",
      });
    }

    await updateVoucher(id, payload);

    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    console.log("Lỗi updateVoucher:", err);
    res.status(500).json({ error: err.message });
  }
};
// ==== DELETE ====
export const deleteVoucherController = async (req, res) => {
  try {
    await deleteVoucher(req.params.id);
    res.json({ message: "Xóa thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==== APPLY (USER) ====
export const applyVoucherController = async (req, res) => {
  try {
    const { code, total } = req.body;

    const voucher = await getVoucherByCode(code?.trim().toUpperCase());
    if (!voucher) return res.status(404).json({ message: "Mã giảm giá không tồn tại" });

    if (voucher.Quantity <= 0)
      return res.status(400).json({ message: "Mã giảm giá đã hết lượt dùng" });

    if (total < voucher.MinOrder)
      return res.status(400).json({ message: "Đơn hàng chưa đạt giá trị tối thiểu" });

    let discount = 0;

    if (voucher.Type === "percent") {
      discount = (total * voucher.DiscountValue) / 100;
      if (voucher.MaxDiscount) discount = Math.min(discount, voucher.MaxDiscount);
    } else {
      discount = voucher.DiscountValue;
    }

    res.json({ discount, voucher });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
