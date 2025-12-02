import React, { useEffect, useState } from "react";
import Sidebar from "../Layout/Sidebar";
import { Search, Plus, Edit, Trash2, X } from "lucide-react";
import axios from "axios";

const API = "https://backend-eta-ivory-29.vercel.app/api";

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    const [form, setForm] = useState({
        CategoryName: "",
        Slug: "",
        Description: "",
    });

    const [editID, setEditID] = useState(null);

    const axiosClient = axios.create({
        baseURL: API,
        headers: { "Content-Type": "application/json" },
    });

    axiosClient.interceptors.request.use((config) => {
        const token = localStorage.getItem("token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    });

    // ======= FETCH DATA =======
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

    // ======= OPEN MODAL (ADD) =======
    const openAddModal = () => {
        setIsEdit(false);
        setForm({ CategoryName: "", Slug: "", Description: "" });
        setModalOpen(true);
    };

    // ======= OPEN MODAL (EDIT) =======
    const openEditModal = (cat) => {
        setIsEdit(true);
        setEditID(cat.CategoryID);
        setForm({
            CategoryName: cat.CategoryName,
            Slug: cat.Slug,
            Description: cat.Description || "",
        });
        setModalOpen(true);
    };

    // ======= HANDLE SUBMIT =======
    const handleSubmit = async () => {
        if (!form.CategoryName.trim() || !form.Slug.trim()) {
            alert("Tên & Slug không được để trống!");
            return;
        }

        try {
            if (isEdit) {
                // update
                await axiosClient.put(`/categories/sua/${editID}`, form);

                setCategories((prev) =>
                    prev.map((c) =>
                        c.CategoryID === editID ? { ...c, ...form } : c
                    )
                );
            } else {
                // add
                const res = await axiosClient.post("/categories/them", form);
                setCategories((prev) => [
                    ...prev,
                    { CategoryID: res.data.id, ...form },
                ]);
            }
            setModalOpen(false);
        } catch (err) {
            alert("Lỗi thao tác danh mục!");
        }
    };

    // ======= DELETE =======
    const handleDelete = async (id) => {
        if (!window.confirm("Xác nhận xóa danh mục này?")) return;

        try {
            await axiosClient.delete(`/categories/xoa/${id}`);
            setCategories((prev) => prev.filter((c) => c.CategoryID !== id));
        } catch {
            alert("Không thể xoá!");
        }
    };

    const filtered = categories.filter(
        (c) =>
            c.CategoryName.toLowerCase().includes(search.toLowerCase()) ||
            c.Slug.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex bg-[#EDEDED] min-h-screen">
            <Sidebar />

            <div className="flex-1 p-6">
                {/* TITLE */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-teal-700">
                        Quản Lý Danh Mục
                    </h1>


                </div>

                {/* SEARCH + BUTTON ROW */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">

                    {/* SEARCH */}
                    <div className="relative w-full sm:w-80">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm theo tên hoặc slug…"
                            className="w-full pl-10 pr-3 py-2 border rounded-xl shadow-sm bg-white 
                 focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                    </div>

                    {/* ADD BUTTON */}
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl 
               hover:bg-teal-700 transition shadow"
                    >
                        <Plus size={18} /> Thêm danh mục
                    </button>

                </div>
                {/* LOADING */}
                {loading ? (
                    <p className="text-center py-10 text-gray-500">Đang tải dữ liệu...</p>
                ) : (
                    <>
                        {/* MOBILE VIEW - CARD STYLE */}
                        <div className="grid grid-cols-1 md:hidden gap-4">
                            {filtered.map((c) => (
                                <div
                                    key={c.CategoryID}
                                    className="p-4 bg-white rounded-xl shadow hover:shadow-md transition border"
                                >
                                    <div className="font-semibold text-lg">{c.CategoryName}</div>
                                    <div className="text-gray-600 text-sm">@{c.Slug}</div>
                                    <div className="text-gray-500 text-sm mt-2">{c.Description || "—"}</div>

                                    <div className="flex gap-3 mt-4">
                                        <button
                                            onClick={() => openEditModal(c)}
                                            className="flex-1 flex items-center justify-center gap-1 bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600"
                                        >
                                            <Edit size={16} /> Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(c.CategoryID)}
                                            className="flex-1 flex items-center justify-center gap-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600"
                                        >
                                            <Trash2 size={16} /> Xóa
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* DESKTOP TABLE */}
                        <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow border">
                            <table className="min-w-full text-sm">
                                <thead className="bg-teal-600 text-white">
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
                                            className={`border-t hover:bg-teal-50 transition ${i % 2 === 0 ? "bg-gray-50" : "bg-white"
                                                }`}
                                        >
                                            <td className="p-3">{c.CategoryID}</td>
                                            <td className="p-3 font-semibold">{c.CategoryName}</td>
                                            <td className="p-3 text-gray-700">{c.Slug}</td>
                                            <td className="p-3 text-gray-600">
                                                {c.Description || "—"}
                                            </td>

                                            <td className="p-3 text-center space-x-2">
                                                <button
                                                    onClick={() => openEditModal(c)}
                                                    className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(c.CategoryID)}
                                                    className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                                >
                                                    Xóa
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

            {/* ===================== MODAL ===================== */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-11/12 sm:w-96 animate-scaleIn relative">

                        <button
                            onClick={() => setModalOpen(false)}
                            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-xl font-semibold text-teal-700 mb-4">
                            {isEdit ? "Sửa Danh Mục" : "Thêm Danh Mục"}
                        </h2>

                        <div className="space-y-3">
                            <input
                                value={form.CategoryName}
                                onChange={(e) => setForm({ ...form, CategoryName: e.target.value })}
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
                                onChange={(e) => setForm({ ...form, Description: e.target.value })}
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
