import React, { useEffect, useState } from "react";
import Header from "../../Layout/Header";
import Footer from "../../Layout/Footer";
import Swal from "sweetalert2";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    FullName: "",
    Email: "",
    Phone: "",
    Address: "",
  });
  const token = localStorage.getItem("token");

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.UserID || storedUser?.id;

  // ✅ Fetch thông tin user
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId || !token) return;
      try {
        const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
    fetchUser();
  }, [userId, token]);

  // ✅ Validate dữ liệu
  const validateForm = () => {
    if (!form.FullName.trim() || !form.Phone.trim() || !form.Address.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu thông tin!",
        text: "Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ.",
        confirmButtonColor: "#a855f7",
      });
      return false;
    }

    // Chỉ cho phép số và độ dài 10-11
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(form.Phone)) {
      Swal.fire({
        icon: "warning",
        title: "Số điện thoại không hợp lệ!",
        text: "Số điện thoại chỉ được chứa số và phải có 10–11 chữ số.",
        confirmButtonColor: "#a855f7",
      });
      return false;
    }

    return true;
  };

  // ✅ Cập nhật thông tin user
  const handleUpdate = async () => {
    if (!user) return;
    if (!validateForm()) return; // ⛔ Chặn nếu không hợp lệ

    try {
      const res = await fetch(`https://backend-eta-ivory-29.vercel.app/api/users/${user.UserID}`, {
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
      });

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

  // ✅ Đặt lại mật khẩu
  const handleResetPassword = async () => {
    const newPass = await Swal.fire({
      title: "Đặt lại mật khẩu",
      input: "password",
      inputLabel: "Nhập mật khẩu mới",
      inputPlaceholder: "Mật khẩu mới của bạn...",
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
      showCancelButton: true,
      inputAttributes: {
        maxlength: 30,
        autocapitalize: "off",
        autocorrect: "off",
      },
    });

    if (!newPass.value) return;

    try {
      const res = await fetch(
        `https://backend-eta-ivory-29.vercel.app/api/users/${user.UserID}/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newPassword: newPass.value }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Đổi mật khẩu thành công!",
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Đổi mật khẩu thất bại",
          text: data.message || "Không thể đổi mật khẩu.",
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

  if (!user)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Đang tải thông tin người dùng...
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-purple-100">
      <Header />

      <main className="flex-grow flex justify-center items-center px-4 py-10 animate-fadeIn">
        <div className="bg-white shadow-2xl p-8 rounded-2xl w-full max-w-lg border border-gray-100 transition-all duration-500 hover:scale-[1.01]">
          <h2 className="text-3xl font-bold text-center text-purple-700 mb-6">
            Thông Tin Tài Khoản
          </h2>

          {/* Form hiển thị */}
          <div className="space-y-4">
            {/* FullName */}
            <div>
              <label className="text-gray-600 font-medium">Họ Tên</label>
              <input
                type="text"
                className={`w-full px-4 py-2 border rounded-lg mt-1 ${
                  editMode
                    ? "focus:ring-2 focus:ring-purple-300 outline-none"
                    : "bg-gray-100 text-gray-500"
                }`}
                value={form.FullName}
                disabled={!editMode}
                onChange={(e) =>
                  setForm({ ...form, FullName: e.target.value })
                }
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-gray-600 font-medium">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 border rounded-lg mt-1 bg-gray-100 text-gray-500"
                value={form.Email}
                disabled
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-gray-600 font-medium">Số điện thoại</label>
              <input
                type="text"
                className={`w-full px-4 py-2 border rounded-lg mt-1 ${
                  editMode
                    ? "focus:ring-2 focus:ring-purple-300 outline-none"
                    : "bg-gray-100 text-gray-500"
                }`}
                value={form.Phone}
                disabled={!editMode}
                onChange={(e) => setForm({ ...form, Phone: e.target.value })}
              />
            </div>

            {/* Address */}
            <div>
              <label className="text-gray-600 font-medium">Địa chỉ</label>
              <input
                type="text"
                className={`w-full px-4 py-2 border rounded-lg mt-1 ${
                  editMode
                    ? "focus:ring-2 focus:ring-purple-300 outline-none"
                    : "bg-gray-100 text-gray-500"
                }`}
                value={form.Address}
                disabled={!editMode}
                onChange={(e) => setForm({ ...form, Address: e.target.value })}
              />
            </div>

            {/* Nút hành động */}
            <div className="flex justify-between mt-6">
              {editMode ? (
                <>
                  <button
                    onClick={handleUpdate}
                    className="w-[48%] py-2 bg-gradient-to-t from-purple-700 via-purple-500 to-purple-400 
                               text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-md"
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
                    className="w-[48%] py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                  >
                    Hủy
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="w-full py-2 bg-gradient-to-t from-purple-700 via-purple-500 to-purple-400 
                             text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-md"
                >
                  Chỉnh sửa thông tin
                </button>
              )}
            </div>
          </div>

          <div className="text-center mt-6">
            <button
              onClick={handleResetPassword}
              className="text-purple-700 font-medium hover:underline"
            >
              Đặt lại mật khẩu
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
