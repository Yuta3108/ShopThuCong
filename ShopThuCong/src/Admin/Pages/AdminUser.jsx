import React, { useEffect, useState } from "react";
import Sidebar from "../Layout/Sidebar";
import axios from "axios";
import Swal from "sweetalert2";
import { Search, Lock, Unlock } from "lucide-react";

const API = "http://localhost:5000/api";

/* ================= AXIOS CLIENT ================= */
const axiosClient = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ================= MAIN ================= */
export default function AdminUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Sidebar mobile
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = (state) =>
    setIsOpen(state !== undefined ? state : !isOpen);

  const user = JSON.parse(localStorage.getItem("user"));

  /* ================= CHECK ADMIN ================= */
  if (!user || user.role !== "admin") {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 font-semibold">
        Bạn không có quyền truy cập trang này.
      </div>
    );
  }

  /* ================= FETCH USERS ================= */
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data } = await axiosClient.get("/users/all");
        setUsers(data);
      } catch (err) {
        console.error("Lỗi load users:", err);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  /* ================= CHANGE ROLE ================= */
  const handleChangeRole = async (userId, newRole) => {
    const confirm = await Swal.fire({
      title: "Xác nhận thay đổi vai trò",
      text: `Bạn có chắc muốn đổi vai trò thành "${newRole}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đổi",
      cancelButtonText: "Huỷ",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axiosClient.put(`/users/${userId}/role`, {
        role: newRole,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.UserID === userId ? { ...u, Role: newRole } : u
        )
      );

      Swal.fire({
        icon: "success",
        title: "Thành công",
        text: "Đã cập nhật vai trò người dùng",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể thay đổi vai trò người dùng",
      });
    }
  };

  /* ================= LOCK / UNLOCK USER ================= */
  const handleToggleLock = async (id, status) => {
  const isLocking = status === 1;

  const result = await Swal.fire({
    title: isLocking ? "Xác nhận khoá tài khoản" : "Xác nhận mở khoá tài khoản",
    text: isLocking
      ? "Bạn có chắc muốn khoá tài khoản này?"
      : "Bạn có chắc muốn mở khoá tài khoản này?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: isLocking ? "#ef4444" : "#22c55e",
    cancelButtonColor: "#64748b",
    confirmButtonText: isLocking ? "Khoá" : "Mở khoá",
    cancelButtonText: "Huỷ",
  });

  if (!result.isConfirmed) return;

  try {
    await axiosClient.put(`/users/${id}/status`, {
      Status: isLocking ? 0 : 1,
    });

    setUsers((prev) =>
      prev.map((u) =>
        u.UserID === id ? { ...u, Status: isLocking ? 0 : 1 } : u
      )
    );

    // Thông báo thành công
    Swal.fire({
      icon: "success",
      title: isLocking ? "Đã khoá tài khoản" : "Đã mở khoá tài khoản",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Thất bại",
      text: "Không thể thay đổi trạng thái người dùng!",
    });
  }
};

  /* ================= FILTER ================= */
  const filteredUsers = users.filter((u) => {
    const s = search.toLowerCase();
    return (
      u.FullName?.toLowerCase().includes(s) ||
      u.Email?.toLowerCase().includes(s) ||
      u.Phone?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="flex bg-[#F5F5F5] min-h-screen">
      {/* SIDEBAR */}
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          onClick={() => toggleSidebar(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      {/* CONTENT */}
      <div className="flex-1 md:ml-64 p-4 sm:p-6">
        <div className="w-full">
          <h1 className="text-2xl font-semibold text-slate-800 mb-6">
            Quản Lý Người Dùng
          </h1>

          {/* SEARCH */}
          <div className="mb-6">
            <div className="relative w-full sm:w-80">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên, email hoặc SĐT…"
                className="w-full pl-10 pr-3 py-2 rounded-xl border bg-white shadow-sm
                           focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <p className="text-center py-10 text-slate-500">
              Đang tải danh sách người dùng…
            </p>
          )}

          {/* TABLE */}
          {!loading && (
            <div className="overflow-x-auto bg-white rounded-2xl shadow-md border">
              <table className="min-w-full text-sm">
                <thead className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
                  <tr>
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">Tên</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">SĐT</th>
                    <th className="p-3 text-left">Vai trò</th>
                    <th className="p-3 text-center">Trạng thái</th>
                    <th className="p-3 text-center">Hành động</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((u, i) => (
                    <tr
                      key={u.UserID}
                      className={`border-t transition hover:bg-teal-50 ${
                        i % 2 === 0 ? "bg-gray-50" : "bg-white"
                      }`}
                    >
                      <td className="p-3">{u.UserID}</td>
                      <td className="p-3 font-semibold">{u.FullName}</td>
                      <td className="p-3">{u.Email}</td>
                      <td className="p-3">{u.Phone || "—"}</td>

                      {/* ROLE EDIT INLINE */}
                      <td className="p-3">
                        <select
                          value={u.Role}
                          disabled={u.UserID === user.id}
                          onChange={(e) =>
                            handleChangeRole(u.UserID, e.target.value)
                          }
                          className="px-2 py-1 rounded-lg border text-sm
                                     focus:ring-2 focus:ring-teal-500
                                     disabled:bg-gray-100
                                     disabled:cursor-not-allowed"
                        >
                          <option value="customer">Customer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      {/* STATUS */}
                      <td className="p-3 text-center">
                        {u.Status === 1 ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                            Hoạt động
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                            Bị khoá
                          </span>
                        )}
                      </td>

                      {/* ACTION */}
                      <td className="p-3 text-center">
                        <button
                          onClick={() =>
                            handleToggleLock(u.UserID, u.Status)
                          }
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-white text-sm ${
                            u.Status === 1
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-gray-500 hover:bg-gray-600"
                          }`}
                        >
                          {u.Status === 1 ? (
                            <>
                              <Lock size={14} /> Khoá
                            </>
                          ) : (
                            <>
                              <Unlock size={14} /> Mở
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <p className="text-center py-6 text-slate-500">
                  Không tìm thấy người dùng.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
