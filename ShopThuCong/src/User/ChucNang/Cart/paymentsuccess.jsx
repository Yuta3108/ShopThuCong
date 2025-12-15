import { Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const API = "https://backend-eta-ivory-29.vercel.app/api";

export default function PaymentSuccess() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null); // null | pending | processing | completed | cancelled

  useEffect(() => {
    const orderId = localStorage.getItem("pendingOrderId");
    const token = localStorage.getItem("token");

    // KHÔNG CÓ ORDER ID LÀ HỦY
    if (!orderId) {
      setStatus("cancelled");
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      try {
        const res = await fetch(`${API}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok) {
          setStatus(data.Status); // processing / completed / pending
        } else {
          setStatus("cancelled");
        }
      } catch (err) {
        console.error("Payment status error:", err);
        setStatus("pending");
      } finally {
        //  LUÔN TẮT LOADING SAU LẦN FETCH ĐẦU
        setLoading(false);
        localStorage.removeItem("pendingOrderId");
      }
    };

    fetchStatus();
  }, []); //  CHỈ CHẠY 1 LẦN
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Đang xác nhận thanh toán...
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
            : "ZaloPay đang xác nhận giao dịch, vui lòng kiểm tra lại đơn hàng."}
        </p>

        <div className="mt-6 space-y-3">
          <Link
            to="/user"
            className="block w-full py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600"
          >
            Xem đơn hàng
          </Link>

          <Link
            to="/"
            className="block w-full py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            Trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
