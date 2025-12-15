import { Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const API = "https://backend-eta-ivory-29.vercel.app/api";

export default function PaymentSuccess() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("pending"); 

  useEffect(() => {
    const orderId = localStorage.getItem("pendingOrderId");

    if (!orderId) {
      setStatus("cancelled");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");

    const checkStatus = async () => {
      try {
        const res = await fetch(`${API}/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setStatus(data.Status);
        } else {
          setStatus("cancelled");
        }
      } catch (err) {
        console.error("Check payment status error:", err);
        setStatus("pending");
      } finally {
        setLoading(false);
        localStorage.removeItem("pendingOrderId");
      }
    };

    checkStatus();
  }, []);

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
      <div className="bg-white shadow-xl rounded-3xl p-8 max-w-md w-full text-center animate-fadeIn">
        {/* ICON */}
        <div className="flex justify-center mb-4">
          {isSuccess ? (
            <CheckCircle className="text-emerald-500" size={82} />
          ) : isCancelled ? (
            <XCircle className="text-rose-500" size={82} />
          ) : (
            <Loader2 className="animate-spin text-sky-500" size={82} />
          )}
        </div>

        {/* TITLE */}
        <h1 className="text-2xl font-semibold text-slate-800">
          {isSuccess
            ? "Thanh toán thành công!"
            : isCancelled
            ? "Thanh toán đã huỷ"
            : "Đang xác nhận thanh toán"}
        </h1>

        {/* SUBTEXT */}
        <p className="text-slate-500 mt-2 leading-relaxed">
          {isSuccess
            ? "Cảm ơn bạn đã mua hàng tại ThenFong Store. Hóa đơn sẽ được xử lý sớm."
            : isCancelled
            ? "Giao dịch chưa hoàn tất hoặc đã bị huỷ."
            : "ZaloPay đang xác nhận giao dịch của bạn. Vui lòng kiểm tra lại đơn hàng sau ít phút."}
        </p>

        {/* BUTTONS */}
        <div className="mt-6 space-y-3">
          <Link
            to="/user"
            className={`block w-full py-3 rounded-xl font-medium transition shadow ${
              isSuccess
                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                : "bg-slate-500 text-white hover:bg-slate-600"
            }`}
          >
            Xem đơn hàng của bạn
          </Link>

          <Link
            to="/"
            className="block w-full py-3 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition"
          >
            Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
