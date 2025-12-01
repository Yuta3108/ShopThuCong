import {
  getAllVouchers,
  getVoucherById,
  getVoucherByCode,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  decreaseVoucherQuantity
} from "../models/VoucherModel.js";

// Helper convert number
const toNumber = (v, fb = 0) => {
  if (v === undefined || v === null || v === "") return fb;
  if (typeof v === "string")
    v = v.replace(/\./g, "").replace(",", ".");
  const n = Number(v);
  return Number.isNaN(n) ? fb : n;
};

const normalizeDate = (d) => {
  if (!d) return null;
  if (d.includes("/")) {
    const [dd, mm, yy] = d.split("/");
    return `${yy}-${mm}-${dd}`;
  }
  if (d.includes("T")) return d.slice(0, 10);
  return d;
};

// ADMIN — Lấy danh sách voucher
export const getVouchersController = async (req, res) => {
  try {
    const rows = await getAllVouchers();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// ADMIN — Thêm voucher
export const createVoucherController = async (req, res) => {
  try {
    const body = req.body;

    const payload = {
      Code: body.Code.trim(),
      Type: body.Type,
      DiscountValue: toNumber(body.DiscountValue),
      MinOrder: toNumber(body.MinOrder),
      MaxDiscount: body.Type === "fixed" ? 0 : toNumber(body.MaxDiscount),
      Quantity: toNumber(body.Quantity),
      StartDate: normalizeDate(body.StartDate),
      EndDate: normalizeDate(body.EndDate),
      Status: body.Status ? 1 : 0,
    };

    const id = await createVoucher(payload);

    res.json({ VoucherID: id });
  } catch (err) {
    res.status(500).json({ message: "Lỗi tạo voucher", error: err.message });
  }
};

// ADMIN — Sửa voucher
export const updateVoucherController = async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;

    const payload = {
      Code: body.Code.trim(),
      Type: body.Type,
      DiscountValue: toNumber(body.DiscountValue),
      MinOrder: toNumber(body.MinOrder),
      MaxDiscount: body.Type === "fixed" ? 0 : toNumber(body.MaxDiscount),
      Quantity: toNumber(body.Quantity),
      StartDate: normalizeDate(body.StartDate),
      EndDate: normalizeDate(body.EndDate),
      Status: body.Status ? 1 : 0,
    };

    await updateVoucher(id, payload);

    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật voucher", error: err.message });
  }
};

// ADMIN — Xóa voucher
export const deleteVoucherController = async (req, res) => {
  try {
    await deleteVoucher(req.params.id);
    res.json({ message: "Xóa thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xóa voucher", error: err.message });
  }
};

// USER — Áp dụng voucher
export const applyVoucherController = async (req, res) => {
  try {
    const { code, total } = req.body;

    const voucher = await getVoucherByCode(code);
    if (!voucher) return res.status(404).json({ message: "Mã giảm giá không tồn tại" });

    if (voucher.Quantity <= 0)
      return res.status(400).json({ message: "Mã giảm giá đã hết lượt dùng" });

    if (total < voucher.MinOrder)
      return res.status(400).json({ message: "Đơn hàng chưa đạt giá trị tối thiểu" });

    let discount = 0;

    if (voucher.Type === "percent") {
      discount = (total * voucher.DiscountValue) / 100;
      if (voucher.MaxDiscount)
        discount = Math.min(discount, voucher.MaxDiscount);
    } else {
      discount = voucher.DiscountValue;
    }

    res.json({ discount, voucher });
  } catch (err) {
    res.status(500).json({ message: "Lỗi áp dụng voucher", error: err.message });
  }
};
