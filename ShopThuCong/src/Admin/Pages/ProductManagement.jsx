import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Layout/Sidebar";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";

export default function ProductManagement() {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(true);

    // ====== DỮ LIỆU CHÍNH ======
    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);

    // ====== DANH MỤC SẢN PHẨM ======
    const [categories, setCategories] = useState([]); // 🟢 Lưu danh sách danh mục

    // ====== TÌM KIẾM ======
    const [search, setSearch] = useState("");

    // ====== MODALS ======
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // ====== FORM DỮ LIỆU ======
    const [newProduct, setNewProduct] = useState({
        CategoryID: "",
        SKU: "",
        ProductName: "",
        ShortDescription: "",
        Material: "",
        Description: "",
        IsActive: 1,
        variants: [{ SKU: "", Specification: "", Price: 0, StockQuantity: 0, IsActive: 1 }],
    });
    const addVariantToEdit = () => {
        const newVar = {
            SKU: "",
            Specification: "",
            Price: 0,
            StockQuantity: 0,
            IsActive: 1,
            isNew: true,
        };
        setSelectedProduct({
            ...selectedProduct,
            variants: [...(selectedProduct.variants || []), newVar],
        });
    };
    const [selectedProduct, setSelectedProduct] = useState(null);

    // ====== FETCH DỮ LIỆU BAN ĐẦU ======
    useEffect(() => {
        fetchProducts();
        fetchCategories(); // 🟢 Lấy danh mục khi mở trang
    }, []);

    // ====== LẤY DANH MỤC SẢN PHẨM ======
    const fetchCategories = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/categories");
            const data = await res.json();
            setCategories(data.data || data);
        } catch (e) {
            console.error("Lỗi tải danh mục:", e);
        }
    };

    // ====== LẤY DANH SÁCH SẢN PHẨM ======
    const fetchProducts = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/products");
            const data = await res.json();
            const rows = data.data || data;
            setProducts(rows);
            setFiltered(rows);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // ====== TÌM KIẾM SẢN PHẨM ======
    const handleSearch = (val) => {
        setSearch(val);
        const s = val.trim().toLowerCase();
        if (!s) return setFiltered(products);
        setFiltered(
            products.filter(
                (p) =>
                    p.ProductName?.toLowerCase().includes(s) ||
                    p.SKU?.toLowerCase().includes(s) ||
                    p.CategoryName?.toLowerCase().includes(s)
            )
        );
    };

    // ====== CRUD ======
    const openEdit = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/products/${id}`);
            const data = await res.json();
            setSelectedProduct(data);
            setIsEditOpen(true);
        } catch (e) {
            console.error(e);
        }
    };

    const closeEdit = () => {
        setIsEditOpen(false);
        setSelectedProduct(null);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn chắc chắn xoá sản phẩm này?")) return;
        try {
            await fetch(`http://localhost:5000/api/products/${id}`, { method: "DELETE" });
            setProducts((prev) => prev.filter((p) => p.ProductID !== id));
            setFiltered((prev) => prev.filter((p) => p.ProductID !== id));
        } catch (e) {
            console.error(e);
        }
    };

    const handleSaveEdit = async () => {
        try {
            // 🟢 Cập nhật thông tin sản phẩm chính
            await fetch(`http://localhost:5000/api/products/${selectedProduct.ProductID}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(selectedProduct),
            });

            // 🟢 Cập nhật biến thể (giá, tồn kho)
            if (selectedProduct.variants?.length) {
                for (const v of selectedProduct.variants) {
                    await fetch(`http://localhost:5000/api/products/variants/${v.VariantID}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ Price: v.Price, StockQuantity: v.StockQuantity }),
                    });
                }
            }

            alert("Cập nhật thành công");
            closeEdit();
            fetchProducts();
        } catch (e) {
            console.error(e);
            alert("Có lỗi khi cập nhật");
        }
    };

    const addVariantRow = () => {
        setNewProduct((p) => ({
            ...p,
            variants: [...p.variants, { SKU: "", Specification: "", Price: 0, StockQuantity: 0, IsActive: 1 }],
        }));
    };
    const removeVariantRow = (index) => {
        setNewProduct((p) => {
            const arr = [...p.variants];
            arr.splice(index, 1);
            return { ...p, variants: arr };
        });
    };

    const handleAddProduct = async () => {
        try {
            // ⚠️ Kiểm tra xem đã chọn danh mục chưa
            if (!newProduct.CategoryID) {
                alert("⚠️ Vui lòng chọn danh mục sản phẩm!");
                return;
            }

            // 🟢 Tạo sản phẩm
            const res = await fetch("http://localhost:5000/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newProduct),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Create product failed");
            const newId = data.ProductID;

            // 🟢 Tạo biến thể
            for (const v of newProduct.variants) {
                await fetch(`http://localhost:5000/api/products/${newId}/variants`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(v),
                });
            }

            alert("✅ Thêm sản phẩm thành công");
            setIsAddModalOpen(false);
            setNewProduct({
                CategoryID: "",
                SKU: "",
                ProductName: "",
                ShortDescription: "",
                Material: "",
                Description: "",
                IsActive: 1,
                variants: [{ SKU: "", Specification: "", Price: 0, StockQuantity: 0, IsActive: 1 }],
            });
            fetchProducts();
        } catch (e) {
            console.error(e);
            alert("❌ " + e.message);
        }
    };

    // ====== GIAO DIỆN ======
    return (
        <div className="flex min-h-screen bg-[#EDEDED]">
            <Sidebar />

            <div className="flex-1 p-6">
                {/* Header + search */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h1>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Tìm theo tên, SKU hoặc danh mục…"
                                className="w-72 pl-9 pr-3 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                            />
                        </div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 shadow-md"
                        >
                            <Plus size={18} className="mr-2" />
                            Thêm sản phẩm
                        </button>
                    </div>
                </div>

                {/* BẢNG SẢN PHẨM */}
                <div className="overflow-x-auto rounded-xl bg-white border shadow-md">
                    {loading ? (
                        <p className="text-center text-gray-500 py-10">Đang tải dữ liệu…</p>
                    ) : filtered.length === 0 ? (
                        <p className="text-center text-gray-500 py-10">Không tìm thấy sản phẩm.</p>
                    ) : (
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-teal-400 to-teal-300 text-white">
                                    <th className="px-4 py-3 text-left">Mã SP</th>
                                    <th className="px-4 py-3 text-left">Tên sản phẩm</th>
                                    <th className="px-4 py-3 text-left">Danh mục</th>
                                    <th className="px-4 py-3 text-center">Giá thấp nhất</th>
                                    <th className="px-4 py-3 text-center">Trạng thái</th>
                                    <th className="px-4 py-3 text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((p, idx) => (
                                    <tr key={p.ProductID} className={`border-b ${idx % 2 ? "bg-gray-50" : "bg-white"} hover:bg-gray-50`}>
                                        <td className="px-4 py-3 font-semibold text-gray-700">{p.ProductID}</td>
                                        <td className="px-4 py-3">{p.ProductName}</td>
                                        <td className="px-4 py-3 text-gray-600">{p.CategoryName || "—"}</td>
                                        <td className="px-4 py-3 text-center text-teal-700 font-semibold">
                                            {p.minPrice ? p.minPrice.toLocaleString("vi-VN") + "₫" : "—"}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {p.IsActive ? (
                                                <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">Hoạt động</span>
                                            ) : (
                                                <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700">Ngừng bán</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => openEdit(p.ProductID)}
                                                className="inline-flex items-center p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 text-yellow-700 mr-2"
                                                title="Sửa"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(p.ProductID)}
                                                className="inline-flex items-center p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600"
                                                title="Xoá"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* 🟢 MODAL: THÊM SẢN PHẨM */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white rounded-2xl shadow-2xl w-[720px] max-h-[90vh] overflow-y-auto p-6 relative">
                        <button onClick={() => setIsAddModalOpen(false)} className="absolute right-3 top-3 text-gray-500 hover:text-gray-700">
                            <X size={22} />
                        </button>

                        <h2 className="text-xl font-bold text-teal-600 mb-4">Thêm sản phẩm mới</h2>

                        <div className="space-y-4">
                            {/* Tên sản phẩm */}
                            <input className="w-full border rounded-lg px-3 py-2" placeholder="Tên sản phẩm"
                                value={newProduct.ProductName}
                                onChange={(e) => setNewProduct({ ...newProduct, ProductName: e.target.value })} />

                            {/* 🟢 Dropdown chọn danh mục */}
                            <select
                                className="w-full border rounded-lg px-3 py-2 bg-white"
                                value={newProduct.CategoryID || ""}
                                onChange={(e) =>
                                    setNewProduct({
                                        ...newProduct,
                                        CategoryID: e.target.value ? parseInt(e.target.value) : null,
                                    })
                                }
                            >
                                <option value="">-- Chọn danh mục sản phẩm --</option>
                                {categories.map((c) => (
                                    <option key={c.CategoryID} value={c.CategoryID}>
                                        {c.CategoryName}
                                    </option>
                                ))}
                            </select>

                            {/* Mã SKU */}
                            <input className="w-full border rounded-lg px-3 py-2" placeholder="Mã SKU"
                                value={newProduct.SKU}
                                onChange={(e) => setNewProduct({ ...newProduct, SKU: e.target.value })} />

                            {/* Mô tả ngắn */}
                            <textarea className="w-full border rounded-lg px-3 py-2" placeholder="Mô tả ngắn"
                                value={newProduct.ShortDescription}
                                onChange={(e) => setNewProduct({ ...newProduct, ShortDescription: e.target.value })} />

                            {/* Chất liệu */}
                            <input className="w-full border rounded-lg px-3 py-2" placeholder="Chất liệu"
                                value={newProduct.Material}
                                onChange={(e) => setNewProduct({ ...newProduct, Material: e.target.value })} />

                            {/* Mô tả chi tiết */}
                            <textarea className="w-full border rounded-lg px-3 py-2" placeholder="Mô tả chi tiết"
                                value={newProduct.Description}
                                onChange={(e) => setNewProduct({ ...newProduct, Description: e.target.value })} />

                            {/* ====== BIẾN THỂ ====== */}
                            <div className="pt-4 border-t">
                                <h3 className="text-lg font-semibold mb-3">Biến thể sản phẩm</h3>

                                {newProduct.variants.map((v, i) => (
                                    <div key={i} className="bg-gray-50 border rounded-xl p-3 mb-3">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-12 md:col-span-6">
                                                <input
                                                    className="w-full border rounded px-3 py-2"
                                                    placeholder="SKU biến thể"
                                                    value={v.SKU}
                                                    onChange={(e) => {
                                                        const arr = [...newProduct.variants];
                                                        arr[i].SKU = e.target.value;
                                                        setNewProduct({ ...newProduct, variants: arr });
                                                    }}
                                                />
                                            </div>
                                            <div className="col-span-12 md:col-span-6">
                                                <input
                                                    className="w-full border rounded px-3 py-2"
                                                    placeholder="Mô tả (VD: Màu đỏ - Size M)"
                                                    value={v.Specification}
                                                    onChange={(e) => {
                                                        const arr = [...newProduct.variants];
                                                        arr[i].Specification = e.target.value;
                                                        setNewProduct({ ...newProduct, variants: arr });
                                                    }}
                                                />
                                            </div>

                                            {/* dòng dưới: giá + tồn kho căn trái */}
                                            <div className="col-span-12 md:col-span-3 flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="w-full border rounded px-3 py-2 text-right"
                                                    placeholder="Giá"
                                                    value={v.Price}
                                                    onChange={(e) => {
                                                        const arr = [...newProduct.variants];
                                                        arr[i].Price = Number(e.target.value);
                                                        setNewProduct({ ...newProduct, variants: arr });
                                                    }}
                                                />
                                                <span className="text-gray-500">₫</span>
                                            </div>
                                            <div className="col-span-12 md:col-span-3 flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="w-full border rounded px-3 py-2 text-right"
                                                    placeholder="Tồn kho"
                                                    value={v.StockQuantity}
                                                    onChange={(e) => {
                                                        const arr = [...newProduct.variants];
                                                        arr[i].StockQuantity = Number(e.target.value);
                                                        setNewProduct({ ...newProduct, variants: arr });
                                                    }}
                                                />
                                                <span className="text-gray-500">SP</span>
                                            </div>
                                            <div className="col-span-12 md:col-span-6 flex md:justify-end">
                                                <button
                                                    onClick={() => removeVariantRow(i)}
                                                    className="px-3 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600"
                                                >
                                                    Xoá biến thể
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button onClick={addVariantRow} className="text-teal-600 font-medium hover:underline">
                                    + Thêm biến thể
                                </button>
                            </div>

                            <button onClick={handleAddProduct} className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700">
                                Lưu sản phẩm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🟢 MODAL: CHỈNH SỬA SẢN PHẨM */}
            {isEditOpen && selectedProduct && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white rounded-2xl shadow-2xl w-[720px] max-h-[90vh] overflow-y-auto p-6 relative">
                        <button onClick={closeEdit} className="absolute right-3 top-3 text-gray-500 hover:text-gray-700">
                            <X size={22} />
                        </button>

                        <h2 className="text-xl font-bold text-teal-600 mb-4">Chỉnh sửa sản phẩm</h2>

                        <div className="space-y-4">
                            {/* 🟢 Dropdown chọn danh mục khi sửa */}
                            <select
                                className="w-full border rounded-lg px-3 py-2 bg-white"
                                value={selectedProduct.CategoryID || ""}
                                onChange={(e) =>
                                    setSelectedProduct({
                                        ...selectedProduct,
                                        CategoryID: e.target.value ? parseInt(e.target.value) : null,
                                    })
                                }
                            >
                                <option value="">-- Chọn danh mục sản phẩm --</option>
                                {categories.map((c) => (
                                    <option key={c.CategoryID} value={c.CategoryID}>
                                        {c.CategoryName}
                                    </option>
                                ))}
                            </select>

                            {/* Các trường khác */}
                            <input className="w-full border rounded-lg px-3 py-2"
                                value={selectedProduct.ProductName || ""}
                                onChange={(e) => setSelectedProduct({ ...selectedProduct, ProductName: e.target.value })} />
                            <input className="w-full border rounded-lg px-3 py-2"
                                value={selectedProduct.SKU || ""}
                                onChange={(e) => setSelectedProduct({ ...selectedProduct, SKU: e.target.value })} />
                            <textarea className="w-full border rounded-lg px-3 py-2"
                                rows={2}
                                value={selectedProduct.ShortDescription || ""}
                                onChange={(e) => setSelectedProduct({ ...selectedProduct, ShortDescription: e.target.value })} />
                            <input className="w-full border rounded-lg px-3 py-2"
                                value={selectedProduct.Material || ""}
                                onChange={(e) => setSelectedProduct({ ...selectedProduct, Material: e.target.value })} />
                            <select className="w-full border rounded-lg px-3 py-2"
                                value={selectedProduct.IsActive ? 1 : 0}
                                onChange={(e) => setSelectedProduct({ ...selectedProduct, IsActive: e.target.value === "1" })}>
                                <option value="1">Hoạt động</option>
                                <option value="0">Ngừng bán</option>
                            </select>

                            {/* ====== BIẾN THỂ ====== */}
                            {/* ====== BIẾN THỂ & GIÁ ====== */}
                            <div className="pt-4 border-t">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-semibold">Biến thể & Giá</h3>
                                    <button
                                        onClick={addVariantToEdit}
                                        className="text-teal-600 font-medium hover:underline"
                                    >
                                        + Thêm biến thể
                                    </button>
                                </div>

                                {(selectedProduct.variants || []).map((v, i) => (
                                    <div key={i} className="bg-gray-50 border rounded-xl p-3 mb-3">
                                        <div className="grid grid-cols-12 gap-3">
                                            {/* Nếu là biến thể cũ thì chỉ hiển thị, nếu là mới thì cho nhập */}
                                            <div className="col-span-12 md:col-span-6">
                                                {v.isNew ? (
                                                    <input
                                                        type="text"
                                                        placeholder="SKU biến thể"
                                                        className="w-full border rounded px-3 py-2 mb-2"
                                                        value={v.SKU}
                                                        onChange={(e) => {
                                                            const updated = [...selectedProduct.variants];
                                                            updated[i].SKU = e.target.value;
                                                            setSelectedProduct({ ...selectedProduct, variants: updated });
                                                        }}
                                                    />
                                                ) : (
                                                    <p className="font-semibold text-gray-800">{v.SKU}</p>
                                                )}
                                                <textarea
                                                    placeholder="Mô tả biến thể"
                                                    className="w-full border rounded px-3 py-2 text-sm"
                                                    value={v.Specification || ""}
                                                    onChange={(e) => {
                                                        const updated = [...selectedProduct.variants];
                                                        updated[i].Specification = e.target.value;
                                                        setSelectedProduct({ ...selectedProduct, variants: updated });
                                                    }}
                                                />
                                            </div>

                                            {/* Giá & Tồn kho */}
                                            <div className="col-span-12 md:col-span-3 flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="w-full border rounded px-3 py-2 text-right"
                                                    value={v.Price}
                                                    onChange={(e) => {
                                                        const updated = [...selectedProduct.variants];
                                                        updated[i].Price = Number(e.target.value);
                                                        setSelectedProduct({ ...selectedProduct, variants: updated });
                                                    }}
                                                />
                                                <span className="text-gray-500">₫</span>
                                            </div>
                                            <div className="col-span-12 md:col-span-3 flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="w-full border rounded px-3 py-2 text-right"
                                                    value={v.StockQuantity}
                                                    onChange={(e) => {
                                                        const updated = [...selectedProduct.variants];
                                                        updated[i].StockQuantity = Number(e.target.value);
                                                        setSelectedProduct({ ...selectedProduct, variants: updated });
                                                    }}
                                                />
                                                <span className="text-gray-500">SP</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="text-right">
                                <button onClick={handleSaveEdit} className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700">
                                    Lưu thay đổi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
