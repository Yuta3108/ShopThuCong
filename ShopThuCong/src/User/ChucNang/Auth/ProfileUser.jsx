import React, { useEffect, useState } from "react";
import Header from "../../Layout/Header";
import Footer from "../../Layout/Footer";
import Swal from "sweetalert2";
import OrderDetailModal from "../../../Admin/Pages/Order/OrderDetailModal";
import ResetPasswordModal from "./ResetPasswordModal";

import { orderStatusText, orderStatusColor } from "../../../utils/orderStatus";
const API = "https://backend-eta-ivory-29.vercel.app/api";
export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [orders, setOrders] = useState([]);
  const [resetOpen, setResetOpen] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [loadingOrderId, setLoadingOrderId] = useState(null);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [form, setForm] = useState({
    FullName: "",
    Email: "",
    Phone: "",
    Address: "",
  });

  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.UserID || storedUser?.id;

  //  FETCH USER + ORDERS 
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId || !token) return;

      try {
        const res = await fetch(
          `${API}/users/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await res.json();
        if (res.ok) {
          setUser(data);
          setForm({
            FullName: data.FullName || "",
            Email: data.Email || "",
            Phone: data.Phone || "",
            Address: data.Address || "",
          });
        } else {
          Swal.fire("Lỗi tải thông tin", data.message, "error");
        }
      } catch {
        Swal.fire("Lỗi kết nối", "Vui lòng thử lại", "error");
      }
    };

    const fetchOrders = async () => {
      try {
        const res = await fetch(
          `${API}/orders/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch {
        console.log("Fetch orders failed");
      }
    };

    fetchUser();
    fetchOrders();
  }, [userId, token]);

  //  VALIDATE 
  const validateForm = () => {
    if (!form.FullName.trim() || !form.Phone.trim() || !form.Address.trim()) {
      Swal.fire("Thiếu thông tin!", "Điền đủ họ tên, số điện thoại, địa chỉ", "warning");
      return false;
    }

    if (!/^[0-9]{10,11}$/.test(form.Phone)) {
      Swal.fire("Lỗi", "Số điện thoại không hợp lệ!", "warning");
      return false;
    }

    return true;
  };

  //  UPDATE INFO 
  const handleUpdate = async () => {
    if (!user || !validateForm()) return;

    try {
      const res = await fetch(
        `${API}/users/${user.UserID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fullName: form.FullName,
            phone: form.Phone,
            address: form.Address,
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setUser({ ...user, ...form });
        setEditMode(false);
        Swal.fire("Thành công", "Cập nhật thành công!", "success");
      } else {
        Swal.fire("Lỗi", data.message, "error");
      }
    } catch {
      Swal.fire("Lỗi server", "Vui lòng thử lại sau", "error");
    }
  };

  //  ĐỔI MẬT KHẨU 
  const submitResetPassword = async (oldPass, newPass) => {
    if (!oldPass || !newPass) {
      Swal.fire("Thiếu thông tin!", "Vui lòng nhập đủ.", "warning");
      return;
    }

    if (newPass.length < 8 || !/[a-zA-Z]/.test(newPass)) {
      Swal.fire("Mật khẩu yếu!", "Mật khẩu phải ≥8 ký tự và có chữ cái!", "warning");
      return;
    }

    try {
      const res = await fetch(
        `${API}/${user.UserID}/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldPassword: oldPass,
            newPassword: newPass,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        Swal.fire("Thành công!", "Đổi mật khẩu thành công!", "success");
        setResetOpen(false);
      } else {
        Swal.fire("Lỗi!", data.message, "error");
      }
    } catch {
      Swal.fire("Lỗi server!", "Không kết nối được", "error");
    }
  };

  //  HUỶ ĐƠN 
  const cancelOrder = async (orderId, paymentMethod) => {
  const confirm = await Swal.fire({
    title: "Huỷ đơn?",
    text: "Bạn chắc chắn muốn huỷ đơn này?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#e11d48",
    confirmButtonText: "Xác nhận",
  });

  if (!confirm.isConfirmed) return;

  const url =
    paymentMethod === "zalopay"
      ? `${API}/orders/${orderId}/cancel-zalopay`
      : `${API}/orders/${orderId}/cancel`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (res.ok) {
      Swal.fire("Đã huỷ!", data.message || "Đơn hàng đã được huỷ.", "success");

      setOrders((prev) =>
        prev.map((o) =>
          o.OrderID === orderId ? { ...o, Status: "cancelled" } : o
        )
      );
    } else {
      Swal.fire("Không thể huỷ", data.message, "error");
    }
  } catch {
    Swal.fire("Lỗi server!", "Không thể kết nối", "error");
  }
};

  //  XEM CHI TIẾT ĐƠN 
  const handleViewDetail = async (orderId) => {
    setLoadingOrderId(orderId);

    try {
      const res = await fetch(
        `${API}/orders/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();

      if (res.ok) {
        setDetailData(data);
        setDetailOpen(true);
      } else {
        Swal.fire("Lỗi", data.message, "error");
      }
    } catch {
      Swal.fire("Lỗi server!", "Không thể kết nối", "error");
    }

    setLoadingOrderId(null); // reset lại
  };

  //  PHÂN TRANG 
  const last = currentPage * itemsPerPage;
  const first = last - itemsPerPage;
  const currentOrders = orders.slice(first, last);
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        Đang tải thông tin...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      <Header />

      <main className="flex-grow px-4 py-10 flex justify-center">
        <div className="bg-white shadow-xl p-8 rounded-3xl w-full max-w-lg border">

          {/*  TABS  */}
          <div className="flex justify-center gap-3 mb-6">
            <button
              onClick={() => setActiveTab("info")}
              className={`px-5 py-2 rounded-full text-sm font-semibold ${activeTab === "info"
                  ? "bg-rose-500 text-white"
                  : "bg-slate-100 text-slate-600"
                }`}
            >
              Thông tin tài khoản
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`px-5 py-2 rounded-full text-sm font-semibold ${activeTab === "orders"
                  ? "bg-rose-500 text-white"
                  : "bg-slate-100 text-slate-600"
                }`}
            >
              Lịch sử đơn hàng
            </button>
          </div>

          {/*  TAB INFO  */}
          {activeTab === "info" && (
            <>
              <h2 className="text-2xl font-bold text-center text-rose-500 mb-6">
                Thông tin tài khoản
              </h2>

              {/* INPUTS */}
              <div className="space-y-4 text-sm">
                {/* Name */}
                <div>
                  <label className="font-medium text-slate-600">Họ tên</label>
                  <input
                    type="text"
                    value={form.FullName}
                    disabled={!editMode}
                    onChange={(e) =>
                      setForm({ ...form, FullName: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-lg mt-1 ${editMode
                        ? "bg-white focus:ring-2 focus:ring-rose-200"
                        : "bg-slate-100"
                      }`}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="font-medium text-slate-600">Email</label>
                  <input
                    type="text"
                    disabled
                    value={form.Email}
                    className="w-full px-4 py-2 border rounded-lg mt-1 bg-slate-100"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="font-medium text-slate-600">Số điện thoại</label>
                  <input
                    type="text"
                    value={form.Phone}
                    disabled={!editMode}
                    onChange={(e) =>
                      setForm({ ...form, Phone: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-lg mt-1 ${editMode
                        ? "bg-white focus:ring-2 focus:ring-rose-200"
                        : "bg-slate-100"
                      }`}
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="font-medium text-slate-600">Địa chỉ</label>
                  <input
                    type="text"
                    value={form.Address}
                    disabled={!editMode}
                    onChange={(e) =>
                      setForm({ ...form, Address: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-lg mt-1 ${editMode
                        ? "bg-white focus:ring-2 focus:ring-rose-200"
                        : "bg-slate-100"
                      }`}
                  />
                </div>

                {/* BUTTONS */}
                <div className="flex gap-3 mt-4">
                  {editMode ? (
                    <>
                      <button
                        onClick={handleUpdate}
                        className="w-1/2 py-2 bg-rose-500 text-white rounded-full"
                      >
                        Lưu thay đổi
                      </button>
                      <button
                        onClick={() => {
                          setEditMode(false);
                          setForm({
                            FullName: user.FullName,
                            Email: user.Email,
                            Phone: user.Phone,
                            Address: user.Address,
                          });
                        }}
                        className="w-1/2 py-2 bg-slate-200 rounded-full"
                      >
                        Hủy
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditMode(true)}
                      className="w-full py-2 bg-rose-500 text-white rounded-full"
                    >
                      Chỉnh sửa thông tin
                    </button>
                  )}
                </div>
              </div>

              {/* RESET PASSWORD */}
              <div className="text-center mt-5">
                <button
                  onClick={() => setResetOpen(true)}
                  className="text-rose-500 font-medium hover:underline"
                >
                  Đặt lại mật khẩu
                </button>
              </div>
            </>
          )}

          {/*  TAB ORDERS  */}
          {activeTab === "orders" && (
            <div>
              <h2 className="text-2xl font-bold text-center text-rose-500 mb-4">
                Lịch sử đơn hàng
              </h2>

              {orders.length === 0 ? (
                <p className="text-center text-slate-500">Không có đơn hàng nào</p>
              ) : (
                <>
                  <div className="space-y-4">
                    {currentOrders.map((order) => (
                      <div
                        key={order.OrderID}
                        className="p-5 border rounded-xl shadow bg-white"
                      >
                        <div className="flex justify-between">
                          <p className="font-semibold">Đơn Hàng</p>

                          {/* Badge trạng thái  */}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${orderStatusColor[order.Status]}`}
                          >
                            {orderStatusText[order.Status]}
                          </span>
                        </div>

                        <p className="text-sm text-slate-500 mt-1">
                          Ngày đặt:{" "}
                          {new Date(order.CreatedAt).toLocaleDateString("vi-VN")}
                        </p>

                        <p className="mt-1 text-sm">
                          Tổng tiền:{" "}
                          <span className="font-bold text-rose-500">
                            {Math.max(0, Number(order.Total)).toLocaleString()}₫
                          </span>
                        </p>

                        <div className="flex justify-end gap-3 mt-4">
                          {/* Xem chi tiết */}
                          <button
                            onClick={() => handleViewDetail(order.OrderID)}
                            disabled={loadingOrderId === order.OrderID}
                            className="px-4 py-1.5 bg-rose-500 text-white rounded-lg text-sm shadow"
                          >
                            {loadingOrderId === order.OrderID ? "Đang tải..." : "Xem chi tiết"}
                          </button>

                          {/* Hủy đơn */}
                          {order.Status === "pending" && (
                            <button
                              onClick={() => cancelOrder(order.OrderID, order.PaymentMethod)}
                              className="px-4 py-1.5 border border-red-400 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg text-sm"
                            >
                              Huỷ đơn
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-10 gap-2">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                        className="px-3 py-1 text-sm bg-slate-100 rounded-md disabled:opacity-50"
                      >
                        Trước
                      </button>

                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`px-3 py-1 text-sm rounded-md ${currentPage === i + 1
                              ? "bg-rose-500 text-white"
                              : "bg-slate-100 text-slate-700"
                            }`}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                        className="px-3 py-1 text-sm bg-slate-100 rounded-md disabled:opacity-50"
                      >
                        Sau
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Popup Đổi mật khẩu */}
      <ResetPasswordModal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onSubmit={submitResetPassword}
      />
      <OrderDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        data={detailData}
      />

      <Footer />
    </div>
  );
}
