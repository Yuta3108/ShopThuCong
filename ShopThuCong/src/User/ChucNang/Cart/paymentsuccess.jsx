import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-3xl p-8 max-w-md w-full text-center">

        {/* ICON */}
        <div className="flex justify-center mb-4">
          <CheckCircle
            className="text-emerald-500"
            size={88}
            strokeWidth={1.5}
          />
        </div>

        {/* TITLE */}
        <h1 className="text-2xl font-semibold text-slate-800">
          Đặt hàng thành công!
        </h1>

        {/* SUBTEXT */}
        <p className="text-slate-500 mt-2 leading-relaxed">
          Cảm ơn bạn đã mua hàng tại <b>ThenFong Store</b>.<br />
          Đơn hàng của bạn đã được ghi nhận và đang được xử lý.
        </p>

        {/* ACTIONS */}
        <div className="mt-6 space-y-3">
          <Link
            to="/user"
            className="block w-full py-3 rounded-xl 
                       bg-emerald-500 text-white font-medium 
                       hover:bg-emerald-600 transition"
          >
            Xem đơn hàng của tôi
          </Link>

          <Link
            to="/"
            className="block w-full py-3 rounded-xl 
                       border border-slate-300 text-slate-700 
                       font-medium hover:bg-slate-100 transition"
          >
            Tiếp tục mua sắm
          </Link>
        </div>

      </div>
    </div>
  );
}
