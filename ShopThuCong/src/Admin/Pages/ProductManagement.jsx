// ================== ProductManagement.jsx ==================
import React, { useEffect, useState } from "react";
import { Plus, Search, Settings, Pencil, Trash2 } from "lucide-react";
import Sidebar from "../Layout/Sidebar";
import ProductTable from "../Pages/Products/ProductTable";
import ProductDialog from "../Pages/Products/ProductDialog";

const API = "https://backend-eta-ivory-29.vercel.app/api";

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAttrDialogOpen, setAttrDialogOpen] = useState(false);
  const [editingAttr, setEditingAttr] = useState(null);
  const [newAttrName, setNewAttrName] = useState("");

  /* ================= AUTH HEADER ================= */
  const getAuthHeaders = () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return {};
    try {
      const user = JSON.parse(storedUser);
      if (user?.token) {
        return { Authorization: `Bearer ${user.token}` };
      }
    } catch {
      return {};
    }
    return {};
  };

  /* ================= FETCH DATA ================= */
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API}/categories`);
      const data = await res.json();
      setCategories(data.data || data);
    } catch (err) {
      console.error("Fetch categories error:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API}/products`);
      const data = await res.json();
      const unique = (data.data || data).filter(
        (obj, index, self) =>
          index === self.findIndex((t) => t.ProductID === obj.ProductID)
      );
      const withCover = await Promise.all(
        unique.map(async (p) => {
          try {
            const d = await fetch(`${API}/products/${p.ProductID}`).then((r) =>
              r.json()
            );
            const firstVariant = d.variants?.[0];
            return { ...p, cover: firstVariant?.images?.[0]?.ImageURL || null };
          } catch {
            return { ...p, cover: null };
          }
        })
      );
      setProducts(withCover);
      setLoading(false);
    } catch (err) {
      console.error("Fetch products error:", err);
    }
  };

  const fetchAttributes = async () => {
    try {
      const res = await fetch(`${API}/attributes`);
      const data = await res.json();
      setAttributes(data);
    } catch (err) {
      console.error("Fetch attributes error:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchAttributes();
  }, []);

  /* ================= CRUD: PRODUCT ================= */
const handleAddOrEdit = async (prod) => {
  if (!prod.CategoryID) return alert("Chưa chọn danh mục!");
  const isEdit = !!selectedProduct;
  let ProductID = prod.ProductID;

  try {
    if (!isEdit) {
      // 🟢 TẠO MỚI SẢN PHẨM
      const res = await fetch(`${API}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(prod), // gửi luôn variants cho BE
      });
      const data = await res.json();
      ProductID = Number(data.ProductID);

      if (isNaN(ProductID)) {
        console.error("❌ ProductID không hợp lệ:", data);
        alert("Không thể xác định mã sản phẩm mới được tạo.");
        return;
      }
    } else {
      // 🟡 CẬP NHẬT SẢN PHẨM
      await fetch(`${API}/products/${ProductID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(prod),
      });

      // 🧩 LẤY DANH SÁCH BIẾN THỂ HIỆN CÓ TRONG DB
      const resExist = await fetch(`${API}/products/${ProductID}`);
      const productData = await resExist.json();
      const existingVariants = productData.variants || [];

      // 🧩 LỌC RA CÁC ID BIẾN THỂ CÒN GIỮ LẠI TRONG UI
      const currentVariantIds = prod.variants
        .map((v) => v.VariantID)
        .filter(Boolean);

      //  XOÁ NHỮNG BIẾN THỂ KHÔNG CÒN Ở UI
      for (const variant of existingVariants) {
        if (!currentVariantIds.includes(variant.VariantID)) {
          await fetch(`${API}/products/variants/${variant.VariantID}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
          });
        }
      }

      //  CẬP NHẬT / THÊM MỚI BIẾN THỂ CÒN LẠI
      for (const v of prod.variants) {
        let variantId = v.VariantID;

        if (variantId) {
          // 🔹 UPDATE BIẾN THỂ
          await fetch(`${API}/products/variants/${variantId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
            body: JSON.stringify({
              SKU: v.SKU,
              Price: v.Price,
              StockQuantity: v.StockQuantity,
              Weight: v.Weight || 0,
              IsActive: v.IsActive,
              attributeValueIds: v.attributeValueIds || [],
            }),
          });
        } else {
          //  THÊM BIẾN THỂ MỚI
          const resVar = await fetch(
            `${API}/products/${ProductID}/variants`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
              },
              body: JSON.stringify({
                SKU: v.SKU,
                Price: v.Price,
                StockQuantity: v.StockQuantity,
                Weight: v.Weight || 0,
                IsActive: v.IsActive,
                attributeValueIds: v.attributeValueIds || [],
              }),
            }
          );
          const varData = await resVar.json();
          variantId = Number(varData.VariantID);
        }

        // 🖼️ UPLOAD ẢNH CHO BIẾN THỂ
        if (v.images?.length && variantId) {
          for (const img of v.images) {
            if (typeof img === "string" && img.startsWith("data:image")) {
              await fetch(
                `${API}/products/variants/${variantId}/images`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders(),
                  },
                  body: JSON.stringify({ image: img }),
                }
              );
            }
          }
        }
      }
    }
    setDialogOpen(false);
    setSelectedProduct(null);
    fetchProducts();
  } catch (err) {
    console.error("handleAddOrEdit error:", err);
    alert("Có lỗi xảy ra khi lưu sản phẩm");
  }
};

  const handleEdit = async (id) => {
    const res = await fetch(`${API}/products/${id}`);
    const data = await res.json();
    setSelectedProduct(data);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xoá sản phẩm này?")) return;
    await fetch(`${API}/products/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    setProducts(products.filter((p) => p.ProductID !== id));
  };

  /* ================= CRUD: ATTRIBUTE MANAGER ================= */
  const handleAddAttribute = async () => {
    if (!newAttrName.trim()) return;
    await fetch(`${API}/attributes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ AttributeName: newAttrName }),
    });
    setNewAttrName("");
    fetchAttributes();
  };

  const handleDeleteAttr = async (id) => {
    if (!window.confirm("Xoá thuộc tính này và toàn bộ giá trị con?")) return;
    await fetch(`${API}/attributes/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    fetchAttributes();
  };

  const handleUpdateAttr = async (id, name) => {
    await fetch(`${API}/attributes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ AttributeName: name }),
    });
    setEditingAttr(null);
    fetchAttributes();
  };

  const handleAddValue = async (AttributeID, Value) => {
    await fetch(`${API}/attribute-values`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ AttributeID, Value }),
    });
    fetchAttributes();
  };

  const handleDeleteValue = async (id) => {
    await fetch(`${API}/attribute-values/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    fetchAttributes();
  };
  // ================= Tìm Sản Phẩm =================
const filteredProducts = products.filter((p) => {
  const keyword = search.toLowerCase().trim();
  return (
    p.ProductName?.toLowerCase().includes(keyword) ||
    p.SKU?.toLowerCase().includes(keyword) ||
    p.CategoryName?.toLowerCase().includes(keyword)
  );
});
  return (
    <div className="flex min-h-screen bg-[#EDEDED]">
      <Sidebar />
      <div className="flex-1 p-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <h1 className="text-2xl font-bold text-teal-700">Quản lý sản phẩm</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên, SKU hoặc danh mục…"
                className="w-72 pl-9 pr-3 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white"
              />
            </div>
            <button
              onClick={() => {
                setSelectedProduct(null);
                setDialogOpen(true);
              }}
              className="flex items-center bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 shadow-md"
            >
              <Plus size={18} className="mr-2" /> Thêm sản phẩm
            </button>

            <button
              onClick={() => setAttrDialogOpen(true)}
              className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-md"
            >
              <Settings size={18} className="mr-2" /> Quản lý thuộc tính
            </button>
          </div>
        </header>

        {/* Table */}
        <ProductTable
          products={filteredProducts}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Dialog sản phẩm */}
        <ProductDialog
          isOpen={isDialogOpen}
          onClose={() => {
            setDialogOpen(false);
            setSelectedProduct(null);
          }}
          onSubmit={handleAddOrEdit}
          categories={categories}
          attributes={attributes}
          initialData={selectedProduct}
        />

        {isAttrDialogOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl w-[700px] max-h-[85vh] overflow-y-auto p-6 relative">
              <button
                onClick={() => setAttrDialogOpen(false)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
              <h2 className="text-xl font-bold text-indigo-600 mb-4">
                Quản lý thuộc tính
              </h2>

              <div className="flex gap-2 mb-4">
                <input
                  className="flex-1 border rounded-lg px-3 py-2"
                  placeholder="Nhập tên thuộc tính mới"
                  value={newAttrName}
                  onChange={(e) => setNewAttrName(e.target.value)}
                />
                <button
                  onClick={handleAddAttribute}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  + Thêm
                </button>
              </div>

              {attributes.map((a) => (
                <div
                  key={a.AttributeID}
                  className="border-b pb-3 mb-4 last:border-none last:pb-0"
                >
                  <div className="flex justify-between items-center mb-2">
                    {editingAttr === a.AttributeID ? (
                      <input
                        className="border px-2 py-1 rounded-md flex-1"
                        defaultValue={a.AttributeName}
                        onBlur={(e) =>
                          handleUpdateAttr(a.AttributeID, e.target.value)
                        }
                        autoFocus
                      />
                    ) : (
                      <h3 className="font-semibold text-gray-800">
                        {a.AttributeName}
                      </h3>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingAttr(a.AttributeID)}
                        className="text-yellow-600 hover:text-yellow-800"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteAttr(a.AttributeID)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="ml-4 space-y-1">
                    {a.values?.map((v) => (
                      <div
                        key={v.AttributeValueID}
                        className="flex justify-between bg-gray-50 px-3 py-1 rounded-md"
                      >
                        <span>{v.Value}</span>
                        <button
                          onClick={() => handleDeleteValue(v.AttributeValueID)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-2">
                      <input
                        ref={(el) => (a.inputRef = el)}
                        className="flex-1 border rounded px-3 py-1 text-sm"
                        placeholder="Thêm giá trị mới"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddValue(a.AttributeID, e.target.value);
                            e.target.value = "";
                          }
                        }}
                      />
                      <button
                        onClick={(e) => {
                          const val =
                            e.target.previousSibling?.value?.trim() || "";
                          if (val) {
                            handleAddValue(a.AttributeID, val);
                            a.inputRef.value = "";
                          }
                        }}
                        className="bg-teal-600 text-white px-3 py-1 rounded-md hover:bg-teal-700 text-sm"
                      >
                        + Giá trị
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => setAttrDialogOpen(false)}
                className="w-full mt-4 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
