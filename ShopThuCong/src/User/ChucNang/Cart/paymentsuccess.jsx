import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const API = "http://localhost:5000/api";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const orderId = params.get("orderId");

  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState(
    "Đang xác nhận thanh toán với ZaloPay…"
  );

  useEffect(() => {
    if (!orderId) {
      Swal.fire("Lỗi", "Không tìm thấy đơn hàng", "error");
      return navigate("/");
    }

    let retry = 0;
    const MAX_RETRY = 20;
    const INTERVAL = 2000;

    const timer = setInterval(async () => {
      try {
        setProgress((p) => Math.min(p + 5, 90));

        const res = await axios.post(
          `${API}/payment/confirm-zalopay`,
          { orderId }
        );

        if (res.data.status === "paid") {
          clearInterval(timer);
          setProgress(100);
          setStatusText("Thanh toán thành công ");

          setTimeout(() => {
            Swal.fire("Thành công", "Thanh toán thành công", "success");
            navigate("/");
          }, 800);
          return;
        }

        retry++;
        setStatusText("Đang chờ phản hồi từ cổng thanh toán…");

        if (retry >= MAX_RETRY) {
          clearInterval(timer);

          await axios.post(`${API}/orders/${orderId}/cancel-zalopay`);

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-[360px] bg-white rounded-2xl shadow-xl border border-gray-200 p-6 text-center">
        {/* SPINNER */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>

        {/* TITLE */}
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Đang xử lý thanh toán
        </h2>

        {/* STATUS */}
        <p className="text-sm text-gray-500 mb-4">{statusText}</p>

        {/* PROGRESS BAR */}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-xs text-gray-400 mt-3">
          Vui lòng không tắt trình duyệt…
        </p>
      </div>
    </div>
  );
}
