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
    if (payload.StartDate && payload.EndDate) {
      const start = new Date(payload.StartDate);
      const end = new Date(payload.EndDate);
      if (end < start) {
        return res.status(400).json({
       message: "Ngày kết thúc không được nhỏ hơn ngày bắt đầu",
      });
  }
}
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
    if (payload.StartDate && payload.EndDate) {
      const start = new Date(payload.StartDate);
      const end = new Date(payload.EndDate);

      if (end < start) {
        return res.status(400).json({
          message: "Ngày kết thúc không được nhỏ hơn ngày bắt đầu",
        });
      }
    }
    if (payload.StartDate) {
      const now = new Date();
      const start = new Date(payload.StartDate);

      if (now >= start) {
        return res.status(403).json({
          message: "Voucher đã bắt đầu, không thể chỉnh sửa ngày",
        });
      }
}
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
    const id = Number(req.params.id);

    //  Lấy voucher
    const voucher = await getVoucherById(id);
    if (!voucher) {
      return res.status(404).json({ message: "Voucher không tồn tại" });
    }

    // Lấy StartDate
    if (!voucher.StartDate) {
      return res.status(400).json({
        message: "Voucher chưa có ngày bắt đầu, không thể xoá",
      });
    }

    const startDate = new Date(voucher.StartDate);
    const now = new Date();

    //  Tính số phút từ StartDate
    const diffMinutes = (now - startDate) / (1000 * 60);

    //  RÀNG BUỘC
    if (diffMinutes >= 0) {
      return res.status(403).json({
        message: "Voucher đã bắt đầu hiệu lực, không thể xoá",
      });
    }

    // Cho xoá
    await deleteVoucher(id);
    res.json({ message: "Xoá voucher thành công" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ------------------------- APPLY (USER) ------------------------- */

export const applyVoucherController = async (req, res) => {
  try {
    const { code } = req.body;
    const orderTotal = Number(req.body.orderTotal || req.body.subtotal || 0);

    const voucher = await getVoucherByCode(code);
    if (!voucher) {
      return res.status(400).json({ success: false, message: "Mã voucher không tồn tại!" });
    }

    if (Number(voucher.Status) === 0) {
      return res.status(400).json({ success: false, message: "Voucher đã bị khóa hoặc hết lượt!" });
    }

    if (Number(voucher.Quantity) <= 0) {
      await lockVoucherIfNeeded(voucher.VoucherID);
      return res.status(400).json({ success: false, message: "Voucher đã hết lượt sử dụng!" });
    }

    if (orderTotal < Number(voucher.MinOrder)) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng chưa đạt ${Number(voucher.MinOrder).toLocaleString()}₫ để áp dụng`,
      });
    }

    const discountValue = Number(voucher.DiscountValue || 0);
    const maxDiscount = Number(voucher.MaxDiscount || 0);

    let discount = 0;

    if (voucher.Type === "percent") {
      discount = (orderTotal * discountValue) / 100;
      if (maxDiscount > 0 && discount > maxDiscount) {
        discount = maxDiscount;
      }
    } else {
      discount = discountValue;
    }

    if (!Number.isFinite(discount) || discount <= 0) {
      return res.status(400).json({
        success: false,
        discount: 0,
        message: "Voucher không đủ điều kiện áp dụng",
      });
    }

    return res.json({
      success: true,
      discount,
      message: "Áp dụng voucher thành công!",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
};

