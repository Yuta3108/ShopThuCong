import React, { useEffect, useState } from "react";
import Sidebar from "../Layout/Sidebar";
import { Search, Plus, Edit, Trash2, X, ImageOff } from "lucide-react";
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
  const [previewImage, setPreviewImage] = useState("");

  const [form, setForm] = useState({
    CategoryName: "",
    Description: "",
    imageBase64: "",
  });

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

  // ================= FETCH =================
  const fetchCategories = async () => {
    const { data } = await axiosClient.get("/categories");
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ================= MODAL =================
  const openAdd = () => {
    setIsEdit(false);
    setEditID(null);
    setForm({
      CategoryName: "",
      Description: "",
      imageBase64: "",
    });
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setIsEdit(true);
    setEditID(cat.CategoryID);
    setForm({
      CategoryName: cat.CategoryName,
      Description: cat.Description || "",
      imageBase64: "",
    });
    setPreviewImage(cat.ImageURL || "");
    setModalOpen(true);
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!form.CategoryName.trim()) {
      alert("Tên danh mục không được để trống!");
      return;
    }

    try {
      if (isEdit) {
        await axiosClient.put(`/categories/${editID}`, form);
      } else {
        await axiosClient.post("/categories", form);
      }

      await fetchCategories();
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Lỗi thao tác danh mục!");
    }
  };

  // ================= DELETE CATEGORY =================
  const handleDelete = async (id) => {
    if (!window.confirm("Xác nhận xoá danh mục?")) return;

    try {
      await axiosClient.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.CategoryID !== id));
    } catch {
      alert("Không thể xoá danh mục!");
    }
  };

  // ================= DELETE IMAGE =================
  const handleDeleteImage = async () => {
  if (!window.confirm("Xoá ảnh danh mục?")) return;

  try {
    await axiosClient.delete(`/categories/${editID}/image`);

    setPreviewImage("");
    setForm({ ...form, imageBase64: "" });

    alert("Đã xoá ảnh danh mục");
  } catch {
    alert("Không thể xoá ảnh!");
  }
};

  // ================= FILTER =================
  const filtered = categories.filter((c) =>
    c.CategoryName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex bg-[#F5F5F5] min-h-screen">
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 md:ml-64 p-4 sm:p-6">
        <div className="w-full max-w-none ">
          <h1 className="text-2xl font-semibold text-slate-800 mb-6">
            Quản Lý Danh Mục
          </h1>

          {/* SEARCH + ADD */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
            <div className="relative w-full sm:w-80">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên danh mục..."
                className="w-full pl-10 pr-3 py-2 rounded-xl border bg-white shadow-sm 
                           focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl
                         hover:bg-teal-700 transition shadow"
            >
              <Plus size={18} /> Thêm danh mục
            </button>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-xl shadow border overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-teal-600 text-white">
                <tr>
                  <th className="p-3 text-center">Ảnh</th>
                  <th className="p-3 text-center">ID</th>
                  <th className="p-3 text-center">Tên</th>
                  <th className="p-3 text-center">Slug</th>
                  <th className="p-3 text-center">Mô tả</th>
                  <th className="p-3 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.CategoryID} className="border-t hover:bg-teal-50">
                    <td className="p-3 text-center">
                      <img
                        src={c.ImageURL || "https://placehold.co/80x80"}
                        alt={c.CategoryName}
                        className="w-12 h-12 rounded-lg object-cover border shadow-sm 
                                      cursor-pointer transition-transform
                                      group-hover:scale-110"
                      />
                    </td>
                    <td className="p-3 text-center">{c.CategoryID}</td>
                    <td className="p-3 font-semibold text-center">{c.CategoryName}</td>
                    <td className="p-3 text-slate-600 text-center">{c.Slug}</td>
                    <td className="p-3 text-slate-500 text-center">
                      {c.Description || "—"}
                    </td>
                    <td className="p-3 text-center space-x-2">
                      <button
                        onClick={() => openEdit(c)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded-lg"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(c.CategoryID)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg"
                      >
                        Xoá
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {loading && (
              <div className="p-6 text-center text-slate-500">
                Đang tải dữ liệu...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-11/12 sm:w-96 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-3 top-3 text-slate-500"
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

              <textarea
                value={form.Description}
                onChange={(e) =>
                  setForm({ ...form, Description: e.target.value })
                }
                placeholder="Mô tả"
                className="w-full border p-2 rounded-lg h-24 resize-none"
              />

              {/* IMAGE PICKER */}
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">
                  Ảnh đại diện
                </p>

                <label className="inline-block cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;

                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setPreviewImage(reader.result); // preview ảnh mới
                        setForm({ ...form, imageBase64: reader.result });
                      };
                      reader.readAsDataURL(file);
                    }}
                  />

                  {/* BOX */}
                  <div
                    className={`w-28 h-28 rounded-xl border-2 border-dashed
                          flex items-center justify-center overflow-hidden
                          transition
                          ${previewImage
                        ? "border-slate-300"
                        : "border-slate-300 hover:border-teal-500"
                      }`}
                  >
                    {previewImage ? (
                      <div className="relative w-full h-full">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />

                        {/* DELETE IMAGE (XOÁ CLOUDINARY) */}
                        {isEdit && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteImage();
                            }}
                            className="absolute top-1 right-1 bg-black/60 text-white
                                      rounded-full w-6 h-6 flex items-center
                                      justify-center text-xs hover:bg-black"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-3xl text-slate-400">+</span>
                    )}
                  </div>
                </label>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              className="w-full mt-5 bg-teal-600 text-white py-2 rounded-xl hover:bg-teal-700"
            >
              {isEdit ? "Cập nhật" : "Thêm"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
