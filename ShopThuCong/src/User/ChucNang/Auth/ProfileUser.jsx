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
    fetchUser();
  }, [userId, token]);

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

  const handleResetPassword = async () => {
    const { value: passwords } = await Swal.fire({
      title: "Đổi mật khẩu",
      html: `
      <input id="oldPass" type="password" placeholder="Mật khẩu hiện tại" class="swal2-input" />
      <input id="newPass" type="password" placeholder="Mật khẩu mới" class="swal2-input" />
    `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      preConfirm: () => {
        const oldPass = document.getElementById("oldPass").value;
        const newPass = document.getElementById("newPass").value;

        if (!oldPass || !newPass) {
          Swal.showValidationMessage("Vui lòng nhập đủ 2 mật khẩu");
          return false;
        }
        if (!/[a-zA-Z]/.test(newPass) || newPass.length < 8) {
          Swal.showValidationMessage(
            "🔒 Mật khẩu phải có ít nhất 8 ký tự và chứa ít nhất một chữ cái"
          );
          return false;
        }
        return { oldPass, newPass };
      },
    });

    if (!passwords) return;

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
            oldPassword: passwords.oldPass,
            newPassword: passwords.newPass,
          }),
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
          text: data.message || "Vui lòng kiểm tra lại mật khẩu hiện tại.",
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
      <div className="bg-[#F5F5F5] min-h-screen flex items-center justify-center text-slate-600">
        Đang tải thông tin người dùng...
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />

      <main className="flex-grow flex justify-center items-center px-4 py-10 animate-fadeIn">
        <div className="bg-white shadow-[0_18px_45px_rgba(15,23,42,0.12)] p-8 rounded-3xl w-full max-w-lg border border-slate-200 transition-all duration-500 hover:-translate-y-1">
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
              onClick={handleResetPassword}
              className="text-rose-500 font-medium hover:underline text-sm"
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
