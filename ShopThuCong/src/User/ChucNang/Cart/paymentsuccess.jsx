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
  const maxRetry = 5;

  const interval = setInterval(async () => {
    try {
      const res = await axios.post(
        `${API}/payment/confirm-zalopay`,
        { orderId }
      );

      if (res.data.status === "paid") {
        clearInterval(interval);
        localStorage.removeItem("pendingOrderId");

        Swal.fire("Thành công", "Thanh toán ZaloPay thành công", "success");
        navigate("/");
      } else {
        retry++;
        if (retry >= maxRetry) {
          clearInterval(interval);

          Swal.fire(
            "Đã huỷ",
            "Bạn đã huỷ hoặc giao dịch chưa hoàn tất",
            "warning"
          );
          navigate("/");
        }
      }
    } catch (err) {
      clearInterval(interval);
      Swal.fire("Lỗi", "Không xác nhận được đơn hàng", "error");
      navigate("/");
    }
  }, 2000);

  return () => clearInterval(interval);
}, []);

  return (
    <p className="text-center py-10">
      Đang xác nhận thanh toán...
    </p>
  );
}
