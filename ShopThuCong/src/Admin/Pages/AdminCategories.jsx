import React, { useEffect, useState } from "react";
import Sidebar from "../Layout/Sidebar";
import { Search, Plus, Edit, Trash2, X } from "lucide-react";
import axios from "axios";

const API = "https://backend-eta-ivory-29.vercel.app/api";

// ================= AXIOS CLIENT =================
const axiosClient = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

axiosClient.interceptors.request.use((config) => {
  const tk = localStorage.getItem("token");
  if (tk) config.headers.Authorization = `Bearer ${tk}`;
  return config;
});

// ================= MAIN COMPONENT =================
export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editID, setEditID] = useState(null);

   const toggleSidebar = (state) =>
    setIsOpen(state !== undefined ? state : !isOpen);
  const [form, setForm] = useState({
    CategoryName: "",
    Slug: "",
    Description: "",
  });

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "admin") {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 font-semibold">
        Bạn không có quyền truy cập trang này.
      </div>
    );
  }

  // ================= FETCH DATA =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axiosClient.get("/categories");
        setCategories(data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ================= OPEN MODAL =================
  const openAdd = () => {
    setIsEdit(false);
    setForm({ CategoryName: "", Slug: "", Description: "" });
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setIsEdit(true);
    setEditID(cat.CategoryID);
    setForm({
      CategoryName: cat.CategoryName,
      Slug: cat.Slug,
      Description: cat.Description || "",
    });
    setModalOpen(true);
  };

  // SUBMIT
  const handleSubmit = async () => {
    const { CategoryName, Slug } = form;

    if (!CategoryName.trim() || !Slug.trim()) {
      alert("Tên & Slug không được để trống!");
      return;
    }

    try {
      if (isEdit) {
        await axiosClient.put(`/categories/sua/${editID}`, form);
        setCategories((prev) =>
          prev.map((c) => (c.CategoryID === editID ? { ...c, ...form } : c))
        );
      } else {
        const res = await axiosClient.post("/categories/them", form);
        setCategories((prev) => [...prev, { CategoryID: res.data.id, ...form }]);
      }

      setModalOpen(false);
    } catch {
      alert("Lỗi thao tác với danh mục!");
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Xác nhận xoá danh mục?")) return;

    try {
      await axiosClient.delete(`/categories/xoa/${id}`);
      setCategories((prev) => prev.filter((c) => c.CategoryID !== id));
    } catch {
      alert("Không thể xoá!");
    }
  };

  // FILTER
  const filtered = categories.filter((c) =>
    [c.CategoryName, c.Slug].some((v) =>
      v.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="flex bg-[#F5F5F5] min-h-screen">

      {/* SIDEBAR */}
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      {/* CONTENT */}
      <div className="flex-1 md:ml-64 p-4 sm:p-6">

        <div className="max-w-5xl mx-auto">

          {/* HEADER */}
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight mb-6">
            Quản Lý Danh Mục
          </h1>

          {/* SEARCH / ADD */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-6">

            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên hoặc slug…"
                className="w-full pl-10 pr-3 py-2 rounded-xl border bg-white shadow-sm 
                           focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            {/* ADD Button */}
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl
                         hover:bg-teal-700 transition shadow"
            >
              <Plus size={18} /> Thêm danh mục
            </button>
          </div>

          {/* MOBILE LIST */}
          <div className="grid grid-cols-1 md:hidden gap-4">
            {filtered.map((c) => (
              <div
                key={c.CategoryID}
                className="p-4 bg-white rounded-xl shadow border hover:shadow-md transition"
              >
                <h3 className="font-semibold text-lg">{c.CategoryName}</h3>
                <p className="text-slate-600 text-sm">@{c.Slug}</p>

                <p className="text-slate-500 text-sm mt-2">
                  {c.Description || "Không có mô tả."}
                </p>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => openEdit(c)}
                    className="flex-1 flex items-center justify-center bg-yellow-500 text-white rounded-lg py-2 hover:bg-yellow-600"
                  >
                    <Edit size={16} /> Sửa
                  </button>

                  <button
                    onClick={() => handleDelete(c.CategoryID)}
                    className="flex-1 flex items-center justify-center bg-red-500 text-white rounded-lg py-2 hover:bg-red-600"
                  >
                    <Trash2 size={16} /> Xoá
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow border">
            <table className="min-w-full text-sm">
              <thead className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
                <tr>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Tên danh mục</th>
                  <th className="p-3 text-left">Slug</th>
                  <th className="p-3 text-left w-1/3">Mô tả</th>
                  <th className="p-3 text-center">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((c, i) => (
                  <tr
                    key={c.CategoryID}
                    className={`border-t hover:bg-teal-50 transition ${
                      i % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="p-3">{c.CategoryID}</td>
                    <td className="p-3 font-semibold">{c.CategoryName}</td>
                    <td className="p-3 text-slate-700">{c.Slug}</td>
                    <td className="p-3 text-slate-600">
                      {c.Description || "—"}
                    </td>

                    <td className="p-3 text-center space-x-2">
                      <button
                        onClick={() => openEdit(c)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(c.CategoryID)}
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

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-11/12 sm:w-96 relative">

            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-3 top-3 text-slate-500 hover:text-slate-700"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-semibold text-teal-700 mb-4">
              {isEdit ? "Sửa Danh Mục" : "Thêm Danh Mục"}
            </h2>

            <div className="space-y-3">
              <input
                value={form.CategoryName}
                onChange={(e) =>
                  setForm({ ...form, CategoryName: e.target.value })
                }
                placeholder="Tên danh mục"
                className="w-full border p-2 rounded-lg"
              />

              <input
                value={form.Slug}
                onChange={(e) => setForm({ ...form, Slug: e.target.value })}
                placeholder="Slug"
                className="w-full border p-2 rounded-lg"
              />

              <textarea
                value={form.Description}
                onChange={(e) =>
                  setForm({ ...form, Description: e.target.value })
                }
                placeholder="Mô tả"
                className="w-full border p-2 rounded-lg h-24 resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full mt-5 bg-teal-600 text-white py-2 rounded-xl hover:bg-teal-700 transition"
            >
              {isEdit ? "Cập nhật" : "Thêm"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
