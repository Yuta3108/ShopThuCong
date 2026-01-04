import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const API = "https://backend-eta-ivory-29.vercel.app/api";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const orderId = params.get("orderId");

  useEffect(() => {
    if (!orderId) {
      Swal.fire("Lỗi", "Không tìm thấy đơn hàng", "error");
      return navigate("/");
    }

    // GỌI BACKEND, KHÔNG GỌI ZALOPAY
    axios
      .post(`${API}/payment/confirm-zalopay`, { orderId })
      .then(res => {
    if (res.data.status === "paid") {
      Swal.fire("Thành công", "Thanh toán ZaloPay thành công", "success");
      navigate("/user");
    } else {
      Swal.fire(
        "Đang xử lý",
        "Giao dịch đang chờ xác nhận từ ZaloPay",
        "info"
      );
    }
      })
      .catch(() => {
        Swal.fire(
          "Thông báo",
          "Đơn hàng đang được xử lý",
          "info"
        );
      });
  }, []);

  return (
    <p className="text-center py-10">
      Đang xác nhận thanh toán...
    </p>
  );
}
