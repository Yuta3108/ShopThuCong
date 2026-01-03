import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`https://backend-eta-ivory-29.vercel.app/api/verify/${token}`)
      .then((res) => res.json())
      .then((data) => {
        Swal.fire({
          icon: "success",
          title: data.message,
          timer: 2000,
          showConfirmButton: false,
        });
        setTimeout(() => navigate("/login"), 2000);
      })
      .catch(() => {
        Swal.fire({
          icon: "error",
          title: "Liên kết không hợp lệ hoặc đã hết hạn!",
        });
      });
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] px-4">
      <div className="bg-white rounded-3xl px-8 py-10 shadow-[0_18px_45px_rgba(15,23,42,0.12)] border border-slate-200 text-center max-w-md w-full">
        <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📧</span>
        </div>
        <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2">
          Đang xác minh email...
        </h2>
        <p className="text-sm text-slate-500">
          Vui lòng chờ trong giây lát, chúng tôi đang xử lý yêu cầu xác thực
          tài khoản của bạn.
        </p>
      </div>
    </div>
  );
}
