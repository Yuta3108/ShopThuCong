import React, { useEffect, useState } from "react";
import Sidebar from "../Layout/Sidebar";
import axios from "axios";
import { Search } from "lucide-react";
import Swal from "sweetalert2";

const API = "https://backend-eta-ivory-29.vercel.app/api";

// ========== AXIOS CLIENT ==========
const axiosClient = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ========== MAIN COMPONENT ==========
export default function AdminUserPage() {
  const [users, setUsers] = useState([]);
  const [removing, setRemoving] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  // ===== PROTECT ADMIN =====
  if (!user || user.role !== "admin") {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 font-bold">
        Bạn không có quyền truy cập trang này.
      </div>
    );
  }

  // ===== FETCH USER LIST =====
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axiosClient.get("/users/all");
        setUsers(data);
      } catch {
        setError("Không thể tải danh sách người dùng.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // ===== UPDATE STATUS =====
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus ? 0 : 1;
    try {
      await axiosClient.put(`/users/${id}/status`, { Status: newStatus });

      setUsers((prev) =>
        prev.map((u) => (u.UserID === id ? { ...u, Status: newStatus } : u))
      );
    } catch {
      alert("Cập nhật trạng thái thất bại.");
    }
  };

  // ===== DELETE USER =====
  const handleDelete = async (id) => {
    setRemoving(id);

    setTimeout(async () => {
      try {
        await axiosClient.delete(`/users/${id}`);
        setUsers((prev) => prev.filter((u) => u.UserID !== id));
      } catch {
        alert("Không thể xoá user.");
      } finally {
        setRemoving(null);
      }
    }, 180);
  };

  // ===== UPDATE ROLE =====
  const handleUpdateRole = async (id, newRole) => {
    const confirm = await Swal.fire({
      title: "Xác nhận?",
      text: `Đổi vai trò thành: ${newRole.toUpperCase()}?`,
      icon: "warning",
      confirmButtonText: "Đồng ý",
      showCancelButton: true,
      cancelButtonText: "Hủy",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axiosClient.put(`/users/${id}/Role`, { role: newRole });

      setUsers((prev) =>
        prev.map((u) => (u.UserID === id ? { ...u, Role: newRole } : u))
      );

      Swal.fire({
        icon: "success",
        title: "Cập nhật thành công!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({ icon: "error", title: "Thất bại!" });
    }
  };

  // ===== FILTER =====
  const filtered = users.filter(
    (u) =>
      u.FullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.Email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex bg-[#F5F5F5] min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-64 p-6">
        {/* HEADER */}
        <h1 className="text-2xl font-semibold text-slate-800 tracking-tight mb-6">
          Quản Lý Người Dùng
        </h1>

        {/* SEARCH BAR */}
        <div className="relative w-full sm:w-72 mb-6">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc email…"
            className="w-full pl-10 pr-3 py-2 rounded-xl border bg-white shadow-sm 
                       focus:ring-2 focus:ring-teal-500 outline-none text-sm"
          />
        </div>

        {/* ERROR */}
        {error && <p className="text-red-600 mb-4">{error}</p>}

        {/* LOADING */}
        {loading ? (
          <p className="text-center text-slate-500 py-10">Đang tải dữ liệu...</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow border">
            <table className="min-w-full text-sm">
              <thead className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
                <tr>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Họ Tên</th>
                  <th className="p-3 text-left hidden sm:table-cell">Email</th>
                  <th className="p-3 text-left hidden md:table-cell">SĐT</th>
                  <th className="p-3 text-left hidden md:table-cell">Vai Trò</th>
                  <th className="p-3 text-left">Trạng Thái</th>
                  <th className="p-3 text-center">Hành Động</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((u, i) => (
                  <tr
                    key={u.UserID}
                    className={`border-t transition ${
                      removing === u.UserID ? "opacity-0 scale-[.98]" : ""
                    } ${
                      i % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-teal-50`}
                  >
                    <td className="p-3">{u.UserID}</td>

                    <td className="p-3 font-medium text-slate-800">{u.FullName}</td>

                    <td className="p-3 text-slate-600 hidden sm:table-cell">{u.Email}</td>

                    <td className="p-3 text-slate-600 hidden md:table-cell">{u.Phone}</td>

                    {/* ROLE SELECT */}
                    <td className="p-3 hidden md:table-cell">
                      <select
                        value={u.Role}
                        onChange={(e) =>
                          handleUpdateRole(u.UserID, e.target.value)
                        }
                        className={`px-2 py-1 rounded-lg border text-sm cursor-pointer 
                          ${
                            u.Role === "admin"
                              ? "text-red-600 border-red-400 focus:ring-red-300"
                              : "text-teal-700 border-teal-400 focus:ring-teal-300"
                          }
                          focus:ring-2 outline-none
                        `}
                      >
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    {/* STATUS */}
                    <td className="p-3">
                      {u.Status ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-semibold">
                          Hoạt động
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 font-semibold">
                          Khóa
                        </span>
                      )}
                    </td>

                    {/* ACTION BUTTONS */}
                    <td className="p-3 flex justify-center gap-2">
                      <button
                        onClick={() => handleDelete(u.UserID)}
                        className="px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm transition shadow-sm"
                      >
                        Xóa
                      </button>

                      <button
                        onClick={() => handleToggleStatus(u.UserID, u.Status)}
                        className={`px-3 py-1 rounded-lg text-white text-sm transition shadow-sm 
                          ${
                            u.Status
                              ? "bg-yellow-500 hover:bg-yellow-600"
                              : "bg-green-500 hover:bg-green-600"
                          }
                        `}
                      >
                        {u.Status ? "Khóa" : "Mở"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
