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

    const run = async () => {
      try {
        const res = await fetch(`${API}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok) {
          setStatus(data.Status);
        } else {
          setStatus("cancelled");
        }
      } catch {
        setStatus("pending");
      } finally {
        setLoading(false);
        localStorage.removeItem("pendingOrderId");
      }
    };

    run();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Đang xác nhận thanh toán...
      </div>
    );
  }

  const isSuccess = status === "processing" || status === "completed";

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl text-center">
        {isSuccess ? (
          <CheckCircle className="text-emerald-500 mx-auto" size={72} />
        ) : status === "cancelled" ? (
          <XCircle className="text-rose-500 mx-auto" size={72} />
        ) : (
          <Loader2 className="animate-spin text-sky-500 mx-auto" size={72} />
        )}

        <h1 className="text-xl font-semibold mt-4">
          {isSuccess
            ? "Thanh toán thành công"
            : status === "cancelled"
            ? "Thanh toán đã huỷ"
            : "Đang xác nhận thanh toán"}
        </h1>

        <div className="mt-6 space-y-2">
          <Link to="/user" className="block text-blue-600">
            Xem đơn hàng
          </Link>
          <Link to="/" className="block text-gray-600">
            Trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
