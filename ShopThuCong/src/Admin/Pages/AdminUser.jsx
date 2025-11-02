import React, { useEffect, useState } from "react";
import Sidebar from "../Layout/Sidebar";

export default function AdminUserPage() {
  const [users, setUsers] = useState([]);
  const [removing, setRemoving] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // ✅ Toggle trạng thái user
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus ? 0 : 1;
    try {
      const res = await fetch(
        `https://backend-eta-ivory-29.vercel.app/api/users/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ Status: newStatus }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.UserID === id ? { ...u, Status: newStatus } : u
          )
        );
      } else alert(data.message || "Cập nhật thất bại.");
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
    }
  };

  // ✅ Lấy danh sách user
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(
          "https://backend-eta-ivory-29.vercel.app/api/users/all",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Lỗi tải danh sách user.");
        setUsers(data);
      } catch (err) {
        console.error(err);
        setError("Không thể tải danh sách người dùng.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  // ✅ Xóa user (với animation)
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa user này?")) return;
    setRemoving(id);
    setTimeout(async () => {
      try {
        const res = await fetch(
          `https://backend-eta-ivory-29.vercel.app/api/users/${id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok)
          setUsers((prev) => prev.filter((u) => u.UserID !== id));
      } catch (err) {
        console.error("Lỗi xóa user:", err);
      } finally {
        setRemoving(null);
      }
    }, 300);
  };

  // ✅ Lọc user theo từ khóa
  const filtered = users.filter(
    (u) =>
      u.FullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.Email?.toLowerCase().includes(search.toLowerCase())
  );

  if (!user || user.role !== "admin") {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 font-semibold text-center p-6">
        🚫 Bạn không có quyền truy cập trang này.
      </div>
    );
  }

  return (
    <div className="flex bg-[#EDEDED] min-h-screen">
      <Sidebar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
        <h1 className="text-xl sm:text-2xl font-bold text-teal-700 mb-6 text-center sm:text-left">
          👥 Quản Lý Người Dùng
        </h1>

        {error && <p className="text-red-600">{error}</p>}
        {loading ? (
          <p className="text-center text-gray-500 py-10">Đang tải dữ liệu...</p>
        ) : (
          <>
            {/* 🔍 Ô tìm kiếm */}
            <div className="flex justify-center sm:justify-start mb-4">
              <input
                type="text"
                placeholder="🔍 Tìm kiếm theo tên hoặc email..."
                className="border border-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 p-2 rounded-lg w-full sm:w-80 md:w-96 outline-none text-sm sm:text-base"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* 📋 Bảng user */}
            <div className="overflow-x-auto rounded-lg shadow-md bg-white border border-gray-100">
              <table className="min-w-full text-xs sm:text-sm md:text-base">
                <thead className="bg-gradient-to-r from-teal-400 to-teal-300 text-white">
                  <tr>
                    <th className="p-3 text-left font-semibold">ID</th>
                    <th className="p-3 text-left font-semibold">Họ Tên</th>
                    <th className="p-3 text-left font-semibold hidden sm:table-cell">
                      Email
                    </th>
                    <th className="p-3 text-left font-semibold hidden md:table-cell">
                      SĐT
                    </th>
                    <th className="p-3 text-left font-semibold hidden md:table-cell">
                      Vai Trò
                    </th>
                    <th className="p-3 text-left font-semibold">Trạng Thái</th>
                    <th className="p-3 text-center font-semibold">Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <tr
                      key={u.UserID}
                      className={`border-t transition-all duration-300 ${
                        removing === u.UserID
                          ? "opacity-0 translate-x-4"
                          : "opacity-100"
                      } ${
                        i % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-teal-50`}
                    >
                      <td className="p-3 text-gray-700">{u.UserID}</td>
                      <td className="p-3 font-medium text-gray-800">
                        {u.FullName}
                      </td>
                      <td className="p-3 text-gray-600 hidden sm:table-cell">
                        {u.Email}
                      </td>
                      <td className="p-3 text-gray-600 hidden md:table-cell">
                        {u.Phone}
                      </td>
                      <td className="p-3 capitalize text-teal-700 font-medium hidden md:table-cell">
                        {u.Role}
                      </td>
                      <td className="p-3">
                        {u.Status ? (
                          <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                            Hoạt động
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                            Khóa
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center flex flex-wrap justify-center gap-2">
                        <button
                          className="px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm transition-all"
                          onClick={() => handleDelete(u.UserID)}
                        >
                          Xóa
                        </button>
                        <button
                          className={`px-3 py-1 rounded-lg text-white text-xs sm:text-sm transition-all ${
                            u.Status
                              ? "bg-yellow-500 hover:bg-yellow-600"
                              : "bg-green-500 hover:bg-green-600"
                          }`}
                          onClick={() =>
                            handleToggleStatus(u.UserID, u.Status)
                          }
                        >
                          {u.Status ? "Khóa" : "Mở khóa"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 📱 Gợi ý cuộn trên mobile */}
            <p className="text-xs text-gray-500 mt-2 text-center sm:hidden">
              ⬅️ Vuốt ngang để xem thêm thông tin
            </p>
          </>
        )}
      </div>
    </div>
  );
}
