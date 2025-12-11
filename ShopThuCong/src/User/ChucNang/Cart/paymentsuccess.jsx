import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-3xl p-8 max-w-md w-full text-center animate-fadeIn">
        
        {/* ICON */}
        <div className="flex justify-center mb-4">
          <CheckCircle 
            className="text-emerald-500" 
            size={82} 
            strokeWidth={1.5}
          />
        </div>

        {/* TITLE */}
        <h1 className="text-2xl font-semibold text-slate-800">
          Thanh toán thành công!
        </h1>

        {/* SUBTEXT */}
        <p className="text-slate-500 mt-2 leading-relaxed">
          Cảm ơn bạn đã mua hàng tại ThenFong Store. 
          Hóa đơn đã được gửi về email của bạn.  
          Vui lòng kiểm tra hộp thư nhé!
        </p>

        {/* BUTTONS */}
        <div className="mt-6 space-y-3">
          <Link
            to="/User"
            className="block w-full py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition shadow"
          >
            Xem đơn hàng của bạn tại trang cá nhân
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
