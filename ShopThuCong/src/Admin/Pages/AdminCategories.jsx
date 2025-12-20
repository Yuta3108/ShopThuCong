import React, { useEffect, useState } from "react";
import Sidebar from "../Layout/Sidebar";
import { Search, Plus, X, ImageOff } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";

const API = "https://backend-eta-ivory-29.vercel.app/api";

/*  AXIOS CLIENT  */
const axiosClient = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

axiosClient.interceptors.request.use((config) => {
  const tk = localStorage.getItem("token");
  if (tk) config.headers.Authorization = `Bearer ${tk}`;
  return config;
});

/*  COMPONENT  */
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

  const [submitting, setSubmitting] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  /*  AUTH CHECK  */
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.role !== "admin") {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 font-semibold">
        Bạn không có quyền truy cập trang này.
      </div>
    );
  }

  /*  FETCH  */
  const fetchCategories = async () => {
    try {
      const { data } = await axiosClient.get("/categories");
      setCategories(data);
    } catch {
      Swal.fire({
        title: "Lỗi",
        text: "Không thể tải danh mục!",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /*  MODAL  */
  const openAdd = () => {
    setIsEdit(false);
    setEditID(null);
    setPreviewImage("");
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
    setPreviewImage(cat.ImageURL || "");
    setForm({
      CategoryName: cat.CategoryName,
      Description: cat.Description || "",
      imageBase64: "",
    });
    setModalOpen(true);
  };

  /*  SUBMIT  */
  const handleSubmit = async () => {
    if (!form.CategoryName.trim()) {
      await Swal.fire({
        title: "Thiếu thông tin",
        text: "Tên danh mục không được để trống!",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      setSubmitting(true);

      Swal.fire({
        title: "Đang lưu...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      if (isEdit) {
        await axiosClient.put(`/categories/${editID}`, form);
      } else {
        await axiosClient.post("/categories", form);
      }

      await fetchCategories();
      setModalOpen(false);

      Swal.fire({
        title: "Thành công",
        text: isEdit
          ? "Cập nhật danh mục thành công"
          : "Thêm danh mục thành công",
        confirmButtonText: "OK",
      });
    } catch {
      Swal.fire({
        title: "Lỗi",
        text: "Không thể lưu danh mục!",
        confirmButtonText: "OK",
      });
    } finally {
      setSubmitting(false);
    }
  };

  /*  DELETE CATEGORY  */
  const handleDelete = async (id) => {
    if (deletingCategory) return;

    const result = await Swal.fire({
      title: "Xoá danh mục?",
      text: "Danh mục sẽ bị xoá vĩnh viễn.",
      showCancelButton: true,
      confirmButtonText: "Xoá",
      cancelButtonText: "Huỷ",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingCategory(true);

      Swal.fire({
        title: "Đang xoá...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      await axiosClient.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.CategoryID !== id));

      Swal.fire({
        title: "Đã xoá",
        text: "Danh mục đã được xoá",
        confirmButtonText: "OK",
      });
    } catch {
      Swal.fire({
        title: "Lỗi",
        text: "Không thể xoá danh mục!",
        confirmButtonText: "OK",
      });
    } finally {
      setDeletingCategory(false);
    }
  };

  /*  DELETE IMAGE  */
  const handleDeleteImage = async () => {
    if (deletingImage) return;

    const result = await Swal.fire({
      title: "Xoá ảnh danh mục?",
      text: "Ảnh sẽ bị xoá vĩnh viễn.",
      showCancelButton: true,
      confirmButtonText: "Xoá",
      cancelButtonText: "Huỷ",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingImage(true);

      Swal.fire({
        title: "Đang xoá ảnh...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      await axiosClient.delete(`/categories/${editID}/image`);

      setPreviewImage("");
      setForm({ ...form, imageBase64: "" });

      Swal.fire({
        title: "Đã xoá",
        text: "Ảnh danh mục đã được xoá",
        confirmButtonText: "OK",
      });
    } catch {
      Swal.fire({
        title: "Lỗi",
        text: "Không thể xoá ảnh danh mục!",
        confirmButtonText: "OK",
      });
    } finally {
      setDeletingImage(false);
    }
  };

  /*  FILTER  */
  const filtered = categories.filter((c) =>
    c.CategoryName.toLowerCase().includes(search.toLowerCase())
  );

  /*  RENDER  */
  return (
    <div className="flex bg-[#F5F5F5] min-h-screen">
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 md:ml-64 p-4 sm:p-6">
        <div className="w-full">
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
          <div className="bg-white rounded-2xl shadow border overflow-x-auto">
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
                  <tr
                    key={c.CategoryID}
                    className="border-t hover:bg-teal-50"
                  >
                    <td className="p-3 text-center">
                      <img
                        src={c.ImageURL || "https://placehold.co/80x80"}
                        className="w-12 h-12 object-cover rounded-lg border"
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
                        disabled={deletingCategory}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg disabled:opacity-50"
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
                        setPreviewImage(reader.result);
                        setForm({
                          ...form,
                          imageBase64: reader.result,
                        });
                      };
                      reader.readAsDataURL(file);
                    }}
                  />

                  <div className="w-28 h-28 rounded-xl border-2 border-dashed
                                  flex items-center justify-center overflow-hidden">
                    {previewImage ? (
                      <div className="relative w-full h-full">
                        <img
                          src={previewImage}
                          className="w-full h-full object-cover"
                        />

                        {isEdit && (
                          <button
                            type="button"
                            disabled={deletingImage}
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteImage();
                            }}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full
                                       flex items-center justify-center text-xs
                                       bg-black/60 text-white hover:bg-black"
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
              disabled={submitting}
              className={`w-full mt-5 py-2 rounded-xl text-white
                ${
                  submitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-teal-600 hover:bg-teal-700"
                }`}
            >
              {submitting
                ? "Đang lưu..."
                : isEdit
                ? "Cập nhật"
                : "Thêm"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
