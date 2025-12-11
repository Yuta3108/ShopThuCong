import axios from "axios";
import CryptoJS from "crypto-js";
import moment from "moment";
import { ZaloPayConfig } from "./zalopay.js";

export const createZaloPayOrderService = async (amount, orderId) => {
  try {
    const transID = Math.floor(Math.random() * 1000000);

    // embed_data PHẢI có orderId
    const embed_data = {
      redirecturl: "https://shop-thu-cong.vercel.app/payment-success",
      orderId: orderId
    };

    // items PHẢI có dữ liệu thật
    const items = [
      {
        itemid: orderId,
        itemname: `Đơn hàng #${orderId}`,
        itemprice: amount,
        itemquantity: 1,
      }
    ];

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

    // Tạo MAC đúng format theo ZaloPay
    const data = `${order.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
    
    order.mac = CryptoJS.HmacSHA256(data, ZaloPayConfig.key1).toString();

    // Gọi API
    const response = await axios.post(ZaloPayConfig.endpoint, null, {
      params: order,
    });
    return response.data;
  } catch (err) {
    console.error("Lỗi service:", err.response?.data || err);
    throw err;
  }
};


// verify callback
export const verifyCallbackService = (data, mac) => {
  const myMac = CryptoJS.HmacSHA256(data, ZaloPayConfig.key2).toString();
  return mac === myMac;
};
