import { Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const API = "https://backend-eta-ivory-29.vercel.app/api";
const MAX_RETRY = 6; // ~12s

export default function PaymentSuccess() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("pending");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const orderId = localStorage.getItem("pendingOrderId");
    if (!orderId) {
      setStatus("cancelled");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    let timer;

    const checkStatus = async () => {
      try {
        const res = await fetch(`${API}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok) {
          if (data.Status === "processing" || data.Status === "completed") {
            setStatus(data.Status);
            setLoading(false);
            localStorage.removeItem("pendingOrderId");
            return;
          }

          // vẫn pending → poll tiếp
          if (retry < MAX_RETRY) {
            setRetry((r) => r + 1);
            timer = setTimeout(checkStatus, 2000);
          } else {
            // quá thời gian → giữ pending
            setStatus("pending");
            setLoading(false);
            localStorage.removeItem("pendingOrderId");
          }
        } else {
          setStatus("cancelled");
          setLoading(false);
        }
      } catch (err) {
        console.error("Poll payment status error:", err);
        setStatus("pending");
        setLoading(false);
      }
    };

    checkStatus();
    return () => clearTimeout(timer);
  }, [retry]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Đang xử lý kết quả thanh toán...
      </div>
    );
  }

  const isSuccess = status === "processing" || status === "completed";
  const isCancelled = status === "cancelled";

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-3xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          {isSuccess ? (
            <CheckCircle className="text-emerald-500" size={82} />
          ) : isCancelled ? (
            <XCircle className="text-rose-500" size={82} />
          ) : (
            <Loader2 className="animate-spin text-sky-500" size={82} />
          )}
        </div>

        <h1 className="text-2xl font-semibold text-slate-800">
          {isSuccess
            ? "Thanh toán thành công!"
            : isCancelled
            ? "Thanh toán đã huỷ"
            : "Đang xác nhận thanh toán"}
        </h1>

        <p className="text-slate-500 mt-2">
          {isSuccess
            ? "Cảm ơn bạn đã mua hàng tại ThenFong Store."
            : isCancelled
            ? "Giao dịch đã bị huỷ."
            : "ZaloPay đang xác nhận giao dịch, vui lòng đợi trong giây lát."}
        </p>

        <div className="mt-6 space-y-3">
          <Link
            to="/user"
            className="block w-full py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600"
          >
            Xem đơn hàng của bạn
          </Link>
          <Link
            to="/"
            className="block w-full py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
