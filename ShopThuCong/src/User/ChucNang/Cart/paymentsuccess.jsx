import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const API = "https://backend-eta-ivory-29.vercel.app/api";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const orderId = params.get("orderId");

  useEffect(() => {
    if (!orderId) {
      Swal.fire("Lỗi", "Không tìm thấy đơn hàng", "error");
      return navigate("/");
    }

    let retry = 0;
    const MAX_RETRY = 20;      // ~40s
    const INTERVAL = 2000;    // 3s

    const timer = setInterval(async () => {
      try {
        const res = await axios.post(
          `${API}/payment/confirm-zalopay`,
          { orderId }
        );

        if (res.data.status === "paid") {
          clearInterval(timer);
          Swal.fire("Thành công", "Thanh toán thành công", "success");
          return navigate("/user/orders");
        }

        retry++;
        if (retry >= MAX_RETRY) {
          clearInterval(timer);

          //  HUỶ CHỦ ĐỘNG KHI QUAY VỀ SITE
          await axios.post(
            `${API}/orders/${orderId}/cancel-zalopay`
          );

          Swal.fire(
            "Đã huỷ",
            "Thanh toán không hoàn tất. Đơn hàng đã bị huỷ.",
            "warning"
          );
          navigate("/");
        }
      } catch (e) {
        clearInterval(timer);
        Swal.fire("Lỗi", "Không xác nhận được trạng thái", "error");
        navigate("/");
      }
    }, INTERVAL);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Đang xác nhận thanh toán...</p>
    </div>
  );
}
