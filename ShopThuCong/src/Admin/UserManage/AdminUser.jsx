import React, { useEffect, useState } from "react";
import Sidebar from "../Layout/Sidebar";

export default function AdminUserPage() {
  const [users, setUsers] = useState([]);
  const [removing, setRemoving] = useState(null); // để làm animation khi xóa
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  
  const handleToggleStatus = async (id, currentStatus) => {
  const newStatus = currentStatus ? 0 : 1;
  try {
    const res = await fetch(`http://localhost:5000/api/users/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ Status: newStatus }),
    });

    const data = await res.json();
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) =>
          u.UserID === id ? { ...u, Status: newStatus } : u
        )
      );
    } else {
      alert(data.message || "Cập nhật thất bại.");
    }
  } catch (err) {
    console.error("Lỗi cập nhật trạng thái:", err);
  }
};
  // ===== Lấy danh sách user =====
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("https://backend-eta-ivory-29.vercel.app/api/users/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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

  // ===== Xóa user (với animation fade-out) =====
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa user này?")) return;
    setRemoving(id); // bắt đầu animation
    setTimeout(async () => {
      try {
        const res = await fetch(`https://backend-eta-ivory-29.vercel.app/api/users/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setUsers((prev) => prev.filter((u) => u.UserID !== id));
        }
      } catch (err) {
        console.error("Lỗi xóa user:", err);
      } finally {
        setRemoving(null);
      }
    }, 300); // delay nhẹ để fade-out xong
  };

  // ===== Lọc user theo từ khóa =====
  const filtered = users.filter(
    (u) =>
      u.FullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.Email?.toLowerCase().includes(search.toLowerCase())
  );

  if (!user || user.role !== "admin") {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 font-semibold">
        Bạn không có quyền truy cập trang này.
      </div>
    );
  }

  return (
    <div className="flex bg-[#EDEDED] min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-teal-700 mb-6">
          👥 Quản Lý Người Dùng
        </h1>

        {error && <p className="text-red-600">{error}</p>}
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <>
            {/* Ô tìm kiếm */}
            <input
              type="text"
              placeholder="🔍 Tìm kiếm theo tên hoặc email..."
              className="border border-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 p-2 rounded-lg mb-4 w-96 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* Bảng user */}
            <div className="overflow-x-auto rounded-lg shadow-md bg-white border border-mint-100">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-teal-400 to-teal-200 text-white">
                  <tr>
                    <th className="p-3 text-left font-semibold">ID</th>
                    <th className="p-3 text-left font-semibold">Họ Tên</th>
                    <th className="p-3 text-left font-semibold">Email</th>
                    <th className="p-3 text-left font-semibold">SĐT</th>
                    <th className="p-3 text-left font-semibold">Vai Trò</th>
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
                      } ${i % 2 === 0 ? "bg-mint-50" : "bg-white"} hover:bg-teal-50`}
                    >
                      <td className="p-3">{u.UserID}</td>
                      <td className="p-3 font-medium text-gray-800">
                        {u.FullName}
                      </td>
                      <td className="p-3 text-gray-600">{u.Email}</td>
                      <td className="p-3 text-gray-600">{u.Phone}</td>
                      <td className="p-3 capitalize text-teal-700 font-medium">
                        {u.Role}
                      </td>
                      <td className="p-3">
                        {u.Status ? (
                          <span className="text-green-600 font-semibold">
                            Hoạt động
                          </span>
                        ) : (
                          <span className="text-red-500 font-semibold">
                            Khóa
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          className="px-4 py-1 bg-red-500 rounded-lg hover:bg-red-600 text-white transition-all"
                          onClick={() => handleDelete(u.UserID)}
                        >
                          Xóa
                        </button>
                        <button
                            className={`px-4 py-1 rounded-lg text-white ${
                                u.Status ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-500 hover:bg-green-600"
                            }`}
                            onClick={() => handleToggleStatus(u.UserID, u.Status)}
                            >
                            {u.Status ? "Khóa" : "Mở khóa"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
