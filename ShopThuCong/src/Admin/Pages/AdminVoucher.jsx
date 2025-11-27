import React, { useEffect, useState } from "react";
import Sidebar from "../Layout/Sidebar";
import axios from "axios";
import { Search, Pencil, Trash2 } from "lucide-react";

const API = "https://backend-eta-ivory-29.vercel.app/api";

export default function AdminVoucherPage() {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState(null);
    const [search, setSearch] = useState("");

    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);

    const [editData, setEditData] = useState(null);

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    const axiosClient = axios.create({
        baseURL: API,
        headers: { "Content-Type": "application/json" },
    });

    axiosClient.interceptors.request.use((config) => {
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    });

    if (!user || user.role !== "admin") {
        return (
            <div className="flex justify-center items-center h-screen text-red-600 font-semibold text-center p-6">
                Bạn không có quyền truy cập trang này.
            </div>
        );
    }

    // FETCH VOUCHERS
    useEffect(() => {
        const fetchVouchers = async () => {
            const { data } = await axiosClient.get("/vouchers");
            setVouchers(data);
            setLoading(false);
        };
        fetchVouchers();
    }, []);

    // DELETE
    const handleDelete = async (id) => {
        setRemoving(id);

        setTimeout(async () => {
            await axiosClient.delete(`/vouchers/${id}`);
            setVouchers((prev) => prev.filter((v) => v.VoucherID !== id));
            setRemoving(null);
        }, 200);
    };
    // ADD LOGIC
    const emptyVoucher = {
        Code: "",
        Type: "percent",
        DiscountValue: "",
        MinOrder: 0,
        MaxDiscount: 0,
        Quantity: 100,
        StartDate: "",
        EndDate: "",
        Status: 1,
    };

    const [newVoucher, setNewVoucher] = useState(emptyVoucher);

    const handleAddVoucher = async (e) => {
        e.preventDefault();
        const { data } = await axiosClient.post("/vouchers", newVoucher);

        setVouchers([{ VoucherID: data.VoucherID, ...newVoucher }, ...vouchers]);
        setShowAdd(false);
        setNewVoucher(emptyVoucher);
    };

    // EDIT
    const handleEditVoucher = async (e) => {
        e.preventDefault();

        await axiosClient.put(`/vouchers/${editData.VoucherID}`, editData);

        setVouchers((prev) =>
            prev.map((v) => (v.VoucherID === editData.VoucherID ? editData : v))
        );

        setShowEdit(false);
    };

    // FILTER
    const filtered = vouchers.filter((v) =>
        v.Code.toLowerCase().includes(search.toLowerCase())
    );

    const inputBase =
        "border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 p-2 rounded-lg outline-none transition-all";

    return (
        <div className="flex bg-[#EDEDED] min-h-screen">
            <Sidebar />

            <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">

                {/* Header */}
                <div className="mb-3">
                    <h1 className="text-xl sm:text-2xl font-bold text-teal-700">
                        Quản Lý Voucher
                    </h1>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                    {/* Ô tìm kiếm */}
                    <div className="relative w-full sm:w-80">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm theo mã voucher…"
                            className="w-full pl-9 pr-3 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white text-sm"
                        />
                    </div>

                    {/* Nút Thêm Voucher */}
                    <button
                        onClick={() => setShowAdd(true)}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow text-sm sm:text-base whitespace-nowrap"
                    >
                        + Thêm Voucher
                    </button>
                </div>

                {/* Table */}
                {loading ? (
                    <p className="text-center text-gray-500 py-10">Đang tải...</p>
                ) : (
                    <div className="overflow-x-auto rounded-lg shadow-md bg-white border border-gray-100">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gradient-to-r from-teal-400 to-teal-300 text-white">
                                <tr>
                                    <th className="p-3">ID</th>
                                    <th className="p-3">Code</th>
                                    <th className="p-3">Loại</th>
                                    <th className="p-3">Giá trị</th>
                                    <th className="p-3">Đơn tối thiểu</th>
                                    <th className="p-3">Lượt</th>
                                    <th className="p-3">Trạng thái</th>
                                    <th className="p-3 text-center">Hành động</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filtered.map((v, i) => (
                                    <tr
                                        key={v.VoucherID}
                                        className={`border-t transition-all duration-300 ${removing === v.VoucherID ? "opacity-0 translate-x-4" : ""
                                            } ${i % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-teal-50`}
                                    >
                                        <td className="p-3 text-center">{v.VoucherID}</td>
                                        <td className="p-3 font-semibold text-center">{v.Code}</td>
                                        <td className="p-3 capitalize text-center">{v.Type}</td>

                                        <td className="p-3 text-center">
                                            {v.Type === "percent"
                                                ? `${v.DiscountValue}%`
                                                : `${Number(v.DiscountValue).toLocaleString()}₫`}
                                        </td>

                                        <td className="p-3 text-center">
                                            {Number(v.MinOrder).toLocaleString()}₫
                                        </td>

                                        <td className="p-3 text-center">{v.Quantity}</td>

                                        <td className="p-3 text-center">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-semibold ${v.Status
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {v.Status ? "Hoạt động" : "Khóa"}
                                            </span>
                                        </td>

                                        <td className="p-3 text-center w-40">
                                            <div className="flex justify-center gap-3">
                                                <button
                                                    onClick={() => {
                                                        setEditData(v);
                                                        setShowEdit(true);
                                                    }}
                                                    className="inline-flex items-center justify-center p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 text-yellow-700"
                                                >
                                                    <Pencil size={18} />
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(v.VoucherID)}
                                                    className="inline-flex items-center justify-center p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ===== POPUP THÊM ===== */}
                {showAdd && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center p-4 z-50">
                        <form
                            onSubmit={handleAddVoucher}
                            className="bg-white w-full max-w-xl p-6 rounded-2xl shadow-lg"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-teal-600">Thêm Voucher</h2>
                                <button
                                    type="button"
                                    onClick={() => setShowAdd(false)}
                                    className="text-gray-500 hover:text-red-500 text-xl"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">

                                {/* Code */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium">Mã Voucher</label>
                                    <input
                                        className={inputBase}
                                        required
                                        value={newVoucher.Code}
                                        onChange={(e) =>
                                            setNewVoucher({ ...newVoucher, Code: e.target.value })
                                        }
                                    />
                                </div>

                                {/* Type */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium">Loại</label>
                                    <select
                                        className={inputBase}
                                        value={newVoucher.Type}
                                        onChange={(e) =>
                                            setNewVoucher({
                                                ...newVoucher,
                                                Type: e.target.value,
                                                MaxDiscount: e.target.value === "fixed"
                                                    ? 0
                                                    : newVoucher.MaxDiscount,
                                            })
                                        }
                                    >
                                        <option value="percent">Phần trăm</option>
                                        <option value="fixed">Số tiền</option>
                                    </select>
                                </div>

                                {/* DiscountValue */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium">Giá trị</label>
                                    <input
                                        type="number"
                                        className={inputBase}
                                        required
                                        value={newVoucher.DiscountValue}
                                        onChange={(e) =>
                                            setNewVoucher({
                                                ...newVoucher,
                                                DiscountValue: Number(e.target.value),
                                            })
                                        }
                                    />
                                </div>

                                {/* Min Order */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium">Đơn tối thiểu</label>
                                    <input
                                        type="number"
                                        className={inputBase}
                                        value={newVoucher.MinOrder}
                                        onChange={(e) =>
                                            setNewVoucher({
                                                ...newVoucher,
                                                MinOrder: Number(e.target.value),
                                            })
                                        }
                                    />
                                </div>

                                {/* Max Discount */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium">Giảm tối đa</label>
                                    <input
                                        type={newVoucher.Type === "fixed" ? "text" : "number"}
                                        disabled={newVoucher.Type === "fixed"}
                                        className={`${inputBase} ${newVoucher.Type === "fixed"
                                                ? "bg-gray-100 cursor-not-allowed"
                                                : ""
                                            }`}
                                        value={newVoucher.MaxDiscount}
                                        onChange={(e) =>
                                            setNewVoucher({
                                                ...newVoucher,
                                                MaxDiscount: Number(e.target.value),
                                            })
                                        }
                                    />
                                </div>

                                {/* Quantity */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium">Lượt</label>
                                    <input
                                        type="number"
                                        className={inputBase}
                                        value={newVoucher.Quantity}
                                        onChange={(e) =>
                                            setNewVoucher({
                                                ...newVoucher,
                                                Quantity: Number(e.target.value),
                                            })
                                        }
                                    />
                                </div>

                                {/* Start Date */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium">Ngày bắt đầu</label>
                                    <input
                                        type="date"
                                        className={inputBase}
                                        required
                                        value={newVoucher.StartDate}
                                        onChange={(e) =>
                                            setNewVoucher({
                                                ...newVoucher,
                                                StartDate: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                {/* End Date */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium">Ngày kết thúc</label>
                                    <input
                                        type="date"
                                        className={inputBase}
                                        required
                                        value={newVoucher.EndDate}
                                        onChange={(e) =>
                                            setNewVoucher({
                                                ...newVoucher,
                                                EndDate: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end mt-5 gap-2">
                                <button
                                    onClick={() => setShowAdd(false)}
                                    type="button"
                                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700"
                                >
                                    Lưu
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ===== POPUP SỬA ===== */}
                {showEdit && editData && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center p-4 z-50">
                        <form
                            onSubmit={handleEditVoucher}
                            className="bg-white w-full max-w-xl p-6 rounded-2xl shadow-lg"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-teal-600">
                                    Sửa Voucher
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setShowEdit(false)}
                                    className="text-gray-500 hover:text-red-500 text-xl"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">

                                {/* Code */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium">Mã Voucher</label>
                                    <input
                                        className={inputBase}
                                        required
                                        value={editData.Code}
                                        onChange={(e) =>
                                            setEditData({ ...editData, Code: e.target.value })
                                        }
                                    />
                                </div>

                                {/* Type */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium">Loại</label>
                                    <select
                                        className={inputBase}
                                        value={editData.Type}
                                        onChange={(e) =>
                                            setEditData({
                                                ...editData,
                                                Type: e.target.value,
                                                MaxDiscount: e.target.value === "fixed"
                                                    ? 0
                                                    : editData.MaxDiscount,
                                            })
                                        }
                                    >
                                        <option value="percent">Phần trăm</option>
                                        <option value="fixed">Số tiền</option>
                                    </select>
                                </div>

                                {/* DiscountValue */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium">Giá trị</label>
                                    <input
                                        type="number"
                                        className={inputBase}
                                        required
                                        value={editData.DiscountValue}
                                        onChange={(e) =>
                                            setEditData({
                                                ...editData,
                                                DiscountValue: Number(e.target.value),
                                            })
                                        }
                                    />
                                </div>

                                {/* Min Order */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium">Đơn tối thiểu</label>
                                    <input
                                        type="number"
                                        className={inputBase}
                                        value={editData.MinOrder}
                                        onChange={(e) =>
                                            setEditData({
                                                ...editData,
                                                MinOrder: Number(e.target.value),
                                            })
                                        }
                                    />
                                </div>

                                {/* Max Discount */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium">Giảm tối đa</label>
                                    <input
                                        type={editData.Type === "fixed" ? "text" : "number"}
                                        disabled={editData.Type === "fixed"}
                                        className={`${inputBase} ${editData.Type === "fixed"
                                                ? "bg-gray-100 cursor-not-allowed"
                                                : ""
                                            }`}
                                        value={editData.MaxDiscount}
                                        onChange={(e) =>
                                            setEditData({
                                                ...editData,
                                                MaxDiscount: Number(e.target.value),
                                            })
                                        }
                                    />
                                </div>

                                {/* Quantity */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium">Lượt</label>
                                    <input
                                        type="number"
                                        className={inputBase}
                                        value={editData.Quantity}
                                        onChange={(e) =>
                                            setEditData({
                                                ...editData,
                                                Quantity: Number(e.target.value),
                                            })
                                        }
                                    />
                                </div>

                                {/* Start Date */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium">Ngày bắt đầu</label>
                                    <input
                                        type="date"
                                        className={inputBase}
                                        required
                                        value={editData.StartDate?.slice(0, 10)}
                                        onChange={(e) =>
                                            setEditData({
                                                ...editData,
                                                StartDate: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                {/* End Date */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium">Ngày kết thúc</label>
                                    <input
                                        type="date"
                                        className={inputBase}
                                        required
                                        value={editData.EndDate?.slice(0, 10)}
                                        onChange={(e) =>
                                            setEditData({
                                                ...editData,
                                                EndDate: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end mt-5 gap-2">
                                <button
                                    onClick={() => setShowEdit(false)}
                                    type="button"
                                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                                >
                                    Lưu thay đổi
                                </button>
                            </div>

                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
