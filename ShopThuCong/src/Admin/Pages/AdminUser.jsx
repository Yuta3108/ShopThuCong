import React, { useEffect, useState } from "react";
import Sidebar from "../Layout/Sidebar";
import axios from "axios";
import { Search, Pencil, Trash2, User, Mail, Phone } from "lucide-react";

const API = "https://backend-eta-ivory-29.vercel.app/api";

// AXIOS CLIENT
const axiosClient = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

axiosClient.interceptors.request.use((config) => {
  const tk = localStorage.getItem("token");
  if (tk) config.headers.Authorization = `Bearer ${tk}`;
  return config;
});

// MAIN
export default function AdminUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Sidebar mobile toggle
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = (state) =>
    setIsOpen(state !== undefined ? state : !isOpen);

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "admin") {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 font-semibold">
        Bạn không có quyền truy cập trang này.
      </div>
    );
  }

  // Fetch users
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axiosClient.get("/users/all");
        setUsers(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Delete user
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá tài khoản này?")) return;

    try {
      await axiosClient.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.UserID !== id));
    } catch {
      alert("Không thể xoá người dùng này!");
    }
  };

  // Filter
  const filtered = users.filter((u) => {
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

        <div className="max-w-5xl mx-auto">

          {/* HEADER */}
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight mb-6">
            Quản Lý Người Dùng
          </h1>

          {/* SEARCH */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-6">
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

          {/* ================= MOBILE CARD LIST ================= */}
          <div className="grid grid-cols-1 md:hidden gap-4">
            {filtered.map((u) => (
              <div
                key={u.UserID}
                className="p-4 bg-white rounded-xl border shadow hover:shadow-md transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700">
                    <User size={22} />
                  </div>

                  <div>
                    <p className="font-semibold text-slate-800">{u.FullName}</p>
                    <p className="text-xs text-slate-500">{u.role}</p>
                  </div>
                </div>

                <div className="mt-3 text-sm text-slate-700 space-y-1">
                  <p className="flex items-center gap-2">
                    <Mail size={15} className="text-slate-500" />
                    {u.Email}
                  </p>

                  <p className="flex items-center gap-2">
                    <Phone size={15} className="text-slate-500" />
                    {u.Phone || "Không có SĐT"}
                  </p>
                </div>

                <div className="flex gap-3 mt-4 text-white">
                  <button
                    onClick={() => alert("Tính năng sửa sẽ mở modal")}
                    className="flex-1 py-2 bg-yellow-500 rounded-lg hover:bg-yellow-600"
                  >
                    Sửa
                  </button>

                  <button
                    onClick={() => handleDelete(u.UserID)}
                    className="flex-1 py-2 bg-red-500 rounded-lg hover:bg-red-600"
                  >
                    Xoá
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ================= DESKTOP TABLE ================= */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-2xl shadow-md border">
            <table className="min-w-full text-sm">
              <thead className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
                <tr>
                  <th className="p-3 text-left rounded-tl-2xl">ID</th>
                  <th className="p-3 text-left">Tên</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">SĐT</th>
                  <th className="p-3 text-left">Vai trò</th>
                  <th className="p-3 text-center rounded-tr-2xl">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((u, i) => (
                  <tr
                    key={u.UserID}
                    className={`border-t hover:bg-teal-50 transition ${
                      i % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="p-3">{u.UserID}</td>
                    <td className="p-3 font-semibold">{u.FullName}</td>
                    <td className="p-3">{u.Email}</td>
                    <td className="p-3">{u.Phone || "—"}</td>
                    <td className="p-3 capitalize">{u.role}</td>

                    <td className="p-3 text-center space-x-2">
                      <button
                        onClick={() => alert("Tính năng sửa sẽ mở modal")}
                        className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(u.UserID)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Xoá
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
