
import {
  createZaloPayOrderService,
  verifyCallbackService,
} from "./zaloPayService.js";
import db from "../config/db.js"; 

export const createZaloPayOrder = async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    if (!amount) 
      return res.status(400).json({ message: "Thiếu amount" });

    if (!orderId)
      return res.status(400).json({ message: "Thiếu orderId" });

    // Gọi service (đúng thông số)
    const zaloRes = await createZaloPayOrderService(amount, orderId);

    console.log("ZaloPay trả:", zaloRes); 

    // Trả về cho FE
    return res.json({
      success: true,
      order_url: zaloRes.order_url,
      zp_trans_token: zaloRes.zp_trans_token,
    });

  } catch (err) {
    console.error("ZaloPay ERROR >>>", err?.response?.data || err);

    return res.status(500).json({
      success: false,
      message: "Không thể tạo giao dịch ZaloPay",
      error: err?.response?.data || err?.message
    });
  }
};
export const zaloPayCallback = async (req, res) => {
  try {
    const { data, mac } = req.body;

    const isValid = verifyCallbackService(data, mac);
    if (!isValid) {
      return res.json({ return_code: -1, return_message: "MAC không hợp lệ" });
    }

    const parsed = JSON.parse(data);
    const embed = JSON.parse(parsed.embed_data || "{}");
    const orderId = embed.orderId; // 💖 FIX: lấy đúng orderId

    if (!orderId) {
      console.log("Không tìm thấy orderId trong callback:", parsed);
      return res.json({ return_code: -1, return_message: "Thiếu orderId" });
    }

    await db.query(
      "UPDATE orders SET IsPaid=1, Status='processing' WHERE OrderID=?",
      [orderId]
    );

    return res.json({ return_code: 1, return_message: "success" });
  } catch (err) {
    console.error("Zalo callback error:", err);
    return res.json({ return_code: 0, return_message: "error" });
  }
};

