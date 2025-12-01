import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:5000/api/verify/${token}`)
      .then(res => res.json())
      .then(data => {
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
  }, []);

  return (
    <div className="min-h-screen flex justify-center items-center">
      <h2 className="text-xl font-semibold">Đang xác minh email...</h2>
    </div>
  );
}
