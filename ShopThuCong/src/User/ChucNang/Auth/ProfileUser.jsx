import React, { useEffect, useState } from "react";
import Header from "../../Layout/Header";
import Footer from "../../Layout/Footer";
import Swal from "sweetalert2";
import OrderDetailModal from "../../../Admin/Pages/Order/OrderDetailModal"; 
import ResetPasswordModal from "./ResetPasswordModal";

const statusText = {
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
};

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [orders, setOrders] = useState([]);
  const [resetOpen, setResetOpen] = useState(false);
  // modal chi tiết đơn
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
          `https://backend-eta-ivory-29.vercel.app/api/users/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
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
          Swal.fire({
            icon: "error",
            title: "Lỗi tải thông tin",
            text: data.message || "Không thể tải thông tin người dùng.",
          });
        }
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Lỗi kết nối máy chủ",
          text: "Vui lòng thử lại sau.",
        });
      }
    };

    const fetchOrders = async () => {
      if (!userId || !token) return;
      try {
        const res = await fetch(
          `https://backend-eta-ivory-29.vercel.app/api/orders/user/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log("Fetch orders failed:", err);
      }
    };

    fetchUser();
    fetchOrders();
  }, [userId, token]);

  //  VALIDATE FORM  
  const validateForm = () => {
    if (!form.FullName.trim() || !form.Phone.trim() || !form.Address.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu thông tin!",
        text: "Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ.",
        confirmButtonColor: "#fb7185",
      });
      return false;
    }

    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(form.Phone)) {
      Swal.fire({
        icon: "warning",
        title: "Số điện thoại không hợp lệ!",
        text: "Số điện thoại chỉ được chứa số và phải có 10–11 chữ số.",
        confirmButtonColor: "#fb7185",
      });
      return false;
    }

    return true;
  };

  //  CẬP NHẬT THÔNG TIN  
  const handleUpdate = async () => {
    if (!user) return;
    if (!validateForm()) return;

    try {
      const res = await fetch(
        `https://backend-eta-ivory-29.vercel.app/api/users/${user.UserID}`,
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
        Swal.fire({
          icon: "success",
          title: "Cập nhật thành công!",
          text: "Thông tin tài khoản của bạn đã được lưu.",
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Cập nhật thất bại",
          text: data.message || "Không thể cập nhật thông tin.",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi máy chủ",
        text: "Vui lòng thử lại sau.",
      });
    }
  };

  //  ĐỔI MẬT KHẨU  
  const submitResetPassword = async (oldPass, newPass) => {
  if (!oldPass || !newPass) {
    Swal.fire("Thiếu thông tin!", "Vui lòng điền đầy đủ.", "warning");
    return;
  }

  if (!/[a-zA-Z]/.test(newPass) || newPass.length < 8) {
    Swal.fire("Mật khẩu yếu!", "Phải ≥ 8 ký tự và có chữ cái!", "warning");
    return;
  }

  try {
    const res = await fetch(
      `https://backend-eta-ivory-29.vercel.app/api/${user.UserID}/password`,
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
  } catch (err) {
    Swal.fire("Lỗi server!", "Không kết nối được.", "error");
  }
};


  //  HUỶ ĐƠN HÀNG 
  const cancelOrder = async (orderId) => {
    const confirm = await Swal.fire({
      title: "Huỷ đơn này?",
      text: "Bạn chắc chắn muốn huỷ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      confirmButtonText: "Huỷ đơn",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(
        `https://backend-eta-ivory-29.vercel.app/api/orders/${orderId}/cancel`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        Swal.fire("Đã huỷ!", "Đơn hàng đã được huỷ.", "success");
        setOrders((prev) =>
          prev.map((o) =>
            o.OrderID === orderId ? { ...o, Status: "cancelled" } : o
          )
        );
      } else {
        Swal.fire("Lỗi!", "Không thể huỷ đơn.", "error");
      }
    } catch (err) {
      Swal.fire("Lỗi server!", "Không thể kết nối.", "error");
    }
  };

  //  XEM CHI TIẾT ĐƠN (MỞ MODAL) 
  const handleViewDetail = async (orderId) => {
    setLoadingDetail(true);
    try {
      // chỉnh lại endpoint nếu BE của anh khác
      const res = await fetch(
        `https://backend-eta-ivory-29.vercel.app/api/orders/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (res.ok && data) {
        // giả định BE trả dạng { order, items }
        setDetailData(data);
        setDetailOpen(true);
      } else {
        Swal.fire("Lỗi", data.message || "Không lấy được chi tiết đơn.");
      }
    } catch (err) {
      Swal.fire("Lỗi server!", "Không thể kết nối.", "error");
    } finally {
      setLoadingDetail(false);
    }
  };

  //  TÍNH PHÂN TRANG 
  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.max(1, Math.ceil(orders.length / itemsPerPage));

  if (!user)
    return (
      <div className="bg-[#F5F5F5] min-h-screen flex items-center justify-center text-slate-600">
        Đang tải thông tin người dùng...
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />

      <main className="flex-grow flex justify-center items-center px-4 py-10 animate-fadeIn">
        <div className="bg-white shadow-[0_18px_45px_rgba(15,23,42,0.12)] p-8 rounded-3xl w-full max-w-lg border border-slate-200 transition-all duration-500 hover:-translate-y-1">

          {/* TABS */}
          <div className="flex justify-center gap-3 mb-6">
            <button
              className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                activeTab === "info"
                  ? "bg-rose-500 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
              onClick={() => setActiveTab("info")}
            >
              Thông tin tài khoản
            </button>

            <button
              className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                activeTab === "orders"
                  ? "bg-rose-500 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
              onClick={() => setActiveTab("orders")}
            >
              Lịch sử đơn hàng
            </button>
          </div>

          {/* TAB: THÔNG TIN (giữ nguyên UI cũ) */}
          {activeTab === "info" && (
            <>
              <h2 className="text-2xl md:text-3xl font-bold text-center text-rose-500 mb-6">
                Thông tin tài khoản
              </h2>

              <div className="space-y-4 text-sm">
                <div>
                  <label className="text-slate-600 font-medium">Họ tên</label>
                  <input
                    type="text"
                    className={`w-full px-4 py-2 border rounded-lg mt-1 text-sm ${
                      editMode
                        ? "bg-white focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}
                    value={form.FullName}
                    disabled={!editMode}
                    onChange={(e) =>
                      setForm({ ...form, FullName: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-medium">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border rounded-lg mt-1 bg-slate-100 text-slate-500 border-slate-200 text-sm"
                    value={form.Email}
                    disabled
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-medium">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-2 border rounded-lg mt-1 text-sm ${
                      editMode
                        ? "bg-white focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}
                    value={form.Phone}
                    disabled={!editMode}
                    onChange={(e) =>
                      setForm({ ...form, Phone: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-medium">Địa chỉ</label>
                  <input
                    type="text"
                    className={`w-full px-4 py-2 border rounded-lg mt-1 text-sm ${
                      editMode
                        ? "bg-white focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}
                    value={form.Address}
                    disabled={!editMode}
                    onChange={(e) =>
                      setForm({ ...form, Address: e.target.value })
                    }
                  />
                </div>

                <div className="flex justify-between mt-6 gap-3">
                  {editMode ? (
                    <>
                      <button
                        onClick={handleUpdate}
                        className="w-1/2 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-semibold text-sm shadow-md"
                      >
                        Lưu thay đổi
                      </button>
                      <button
                        onClick={() => {
                          setEditMode(false);
                          setForm({
                            FullName: user.FullName || "",
                            Email: user.Email || "",
                            Phone: user.Phone || "",
                            Address: user.Address || "",
                          });
                        }}
                        className="w-1/2 py-2.5 bg-slate-100 text-slate-700 rounded-full font-semibold text-sm hover:bg-slate-200 border border-slate-200"
                      >
                        Hủy
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditMode(true)}
                      className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-semibold text-sm shadow-md"
                    >
                      Chỉnh sửa thông tin
                    </button>
                  )}
                </div>
              </div>

              <div className="text-center mt-6">
                <button
                  onClick={() => setResetOpen(true)}
                  className="text-rose-500 font-medium hover:underline text-sm"
                >
                  Đặt lại mật khẩu
                </button>
              </div>
            </>
          )}

          {/* TAB: LỊCH SỬ ĐƠN HÀNG */}
          {activeTab === "orders" && (
            <div className="animate-fadeIn">
              <h2 className="text-2xl font-bold text-center text-rose-500 mb-4">
                Lịch sử đơn hàng
              </h2>

              {orders.length === 0 ? (
                <p className="text-center text-slate-500">
                  Không có đơn hàng nào
                </p>
              ) : (
                <>
                  <div className="space-y-4">
                    {currentOrders.map((order) => (
                      <div
                        key={order.OrderID}
                        className="p-5 border rounded-xl shadow bg-white"
                      >
                        <div className="flex justify-between mb-1">
                          <p className="font-semibold text-slate-800">
                            Mã đơn: #{order.OrderID}
                          </p>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold 
                              ${
                                order.Status === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : order.Status === "processing"
                                  ? "bg-blue-100 text-blue-700"
                                  : order.Status === "completed"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }
                            `}
                          >
                            {statusText[order.Status] || order.Status}
                          </span>
                        </div>

                        <p className="text-sm text-slate-500">
                          Ngày đặt:{" "}
                          {new Date(order.CreatedAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>

                        <p className="mt-1 text-sm">
                          Tổng tiền:{" "}
                          <span className="font-bold text-rose-500">
                            {Number(order.Total).toLocaleString()}₫
                          </span>
                        </p>

                        <div className="mt-4 flex justify-end gap-3">
                          <button
                            onClick={() => handleViewDetail(order.OrderID)}
                            disabled={loadingDetail}
                            className="px-4 py-1.5 rounded-lg text-sm font-semibold
                                       bg-rose-500 text-white hover:bg-rose-600 
                                       transition-all shadow-sm disabled:opacity-60"
                          >
                            {loadingDetail ? "Đang tải..." : "Xem chi tiết"}
                          </button>

                          {order.Status === "pending" && (
                            <button
                              onClick={() => cancelOrder(order.OrderID)}
                              className="px-4 py-1.5 rounded-lg text-sm font-semibold
                                         border border-red-400 text-red-500 bg-red-50
                                         hover:bg-red-100 transition-all shadow-sm"
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
                    <div className="flex justify-center mt-6 gap-2">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                        className="px-3 py-1 rounded-md text-sm bg-slate-100 disabled:opacity-50"
                      >
                        Trước
                      </button>

                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`px-3 py-1 rounded-md text-sm ${
                            currentPage === i + 1
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
                        className="px-3 py-1 rounded-md text-sm bg-slate-100 disabled:opacity-50"
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

      {/* MODAL CHI TIẾT ĐƠN */}
      <OrderDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        data={detailData}
      />
      {/* MODAL ĐỔI MẬT KHẨU */}
      <ResetPasswordModal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onSubmit={submitResetPassword}
      />

      <Footer />
    </div>
  );
}
