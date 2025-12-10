import axios from "axios";
import CryptoJS from "crypto-js";
import moment from "moment";
import { ZaloPayConfig } from "./zalopay.js";

export const createZaloPayOrderService = async (amount, orderId) => {
  try {
    const transID = Math.floor(Math.random() * 1000000);
    const embed_data = {};
    const items = [{}];

    const order = {
      app_id: ZaloPayConfig.app_id,
      app_trans_id: `${moment().format("YYMMDD")}_${transID}`,
      app_user: "user123",
      app_time: Date.now(),
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: amount,
      description: `Thanh toán đơn hàng #${orderId}`,
      bank_code: "zalopayapp",
      callback_url: ZaloPayConfig.callback_url,
    };

    // tạo mac
    const data = `${order.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
    order.mac = CryptoJS.HmacSHA256(data, ZaloPayConfig.key1).toString();

    const response = await axios.post(ZaloPayConfig.endpoint, null, { params: order });

    console.log("Zalo trả về:", response.data);

    // trả về kết quả
    return response.data;

  } catch (err) {
    console.error("Lỗi service:", err);
    throw err;
  }
};

// verify callback
export const verifyCallbackService = (data, mac) => {
  const myMac = CryptoJS.HmacSHA256(data, ZaloPayConfig.key2).toString();
  return mac === myMac;
};
