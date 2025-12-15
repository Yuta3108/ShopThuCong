import { Link } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

const API = "https://backend-eta-ivory-29.vercel.app/api";

export default function PaymentSuccess() {
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    const orderId = localStorage.getItem("pendingOrderId");

    //  Không có orderId → coi như huỷ
    if (!orderId) {
      setIsPaid(false);
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");

    const handleResult = async () => {
      try {
        //  Lấy trạng thái đơn hàng
        const res = await fetch(`${API}/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        //  ĐÃ THANH TOÁN THÀNH CÔNG
        if (
          res.ok &&
          (data.Status === "processing" || data.Status === "completed")
        ) {
          setIsPaid(true);
        } else {
          //  HUỶ ZALOPAY → CANCELLED
          setIsPaid(false);

          await fetch(`${API}/orders/${orderId}/cancel`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }
      } catch (error) {
        console.error("Payment result error:", error);
        setIsPaid(false);
      } finally {
        setLoading(false);
        localStorage.removeItem("pendingOrderId");
      }
    };

    handleResult();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Đang xử lý kết quả thanh toán...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-3xl p-8 max-w-md w-full text-center animate-fadeIn">
        {/* ICON */}
        <div className="flex justify-center mb-4">
          {isPaid ? (
            <CheckCircle
              className="text-emerald-500"
              size={82}
              strokeWidth={1.5}
            />
          ) : (
            <XCircle
              className="text-rose-500"
              size={82}
              strokeWidth={1.5}
            />
          )}
        </div>

        {/* TITLE */}
        <h1 className="text-2xl font-semibold text-slate-800">
          {isPaid ? "Thanh toán thành công!" : "Thanh toán đã huỷ"}
        </h1>

        {/* SUBTEXT */}
        <p className="text-slate-500 mt-2 leading-relaxed">
          {isPaid
            ? "Cảm ơn bạn đã mua hàng tại ThenFong Store. Hóa đơn đã được gửi về email của bạn."
            : "Giao dịch chưa hoàn tất hoặc đã bị huỷ. Đơn hàng đã được huỷ thành công."}
        </p>

        {/* BUTTONS */}
        <div className="mt-6 space-y-3">
          <Link
            to="/user"
            className={`block w-full py-3 rounded-xl font-medium transition shadow ${
              isPaid
                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                : "bg-rose-500 text-white hover:bg-rose-600"
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
