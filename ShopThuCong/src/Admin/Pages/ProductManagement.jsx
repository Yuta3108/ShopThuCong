import React, { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import Sidebar from "../Layout/Sidebar";
import ProductTable from "../Pages/Products/ProductTable";
import ProductDialog from "../Pages/Products/ProductDialog";

const API = "http://localhost:5000/api";

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

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

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  /* ================= CRUD ================= */
  const handleAddOrEdit = async (prod) => {
    if (!prod.CategoryID) return alert("Chưa chọn danh mục!");
    const isEdit = !!selectedProduct;
    let ProductID = prod.ProductID;

    try {
      // === Thêm hoặc cập nhật sản phẩm ===
      if (!isEdit) {
        const res = await fetch(`${API}/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(prod),
        });
        const data = await res.json();
        ProductID = data.ProductID;
      } else {
        await fetch(`${API}/products/${ProductID}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(prod),
        });
      }

      // === Thêm hoặc cập nhật biến thể ===
      for (const v of prod.variants) {
        // Nếu variant đã tồn tại -> cập nhật
        if (v.VariantID) {
          await fetch(`${API}/products/variants/${v.VariantID}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
            body: JSON.stringify({
              Price: v.Price,
              StockQuantity: v.StockQuantity,
              Specification: v.Specification,
              IsActive: v.IsActive,
            }),
          });

          // Upload ảnh mới (nếu có)
          if (v.images?.length) {
            for (const img of v.images) {
              if (typeof img === "string" && img.startsWith("data:image")) {
                await fetch(`${API}/products/variants/${v.VariantID}/images`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders(),
                  },
                  body: JSON.stringify({ image: img }),
                });
              }
            }
          }
          continue;
        }

        // Nếu variant mới -> tạo mới
        const payload = {
          SKU: v.SKU,
          Price: v.Price,
          StockQuantity: v.StockQuantity,
          Specification: v.Specification,
          IsActive: v.IsActive,
        };

        const resVar = await fetch(`${API}/products/${ProductID}/variants`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(payload),
        });

        const varData = await resVar.json();
        const variantId = Number(varData.VariantID);
        if (!variantId || isNaN(variantId)) {
          console.error("Không có VariantID hợp lệ:", varData);
          continue;
        }

        // Upload ảnh của variant mới
        if (v.images?.length) {
          for (const img of v.images) {
            await fetch(`${API}/products/variants/${variantId}/images`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
              },
              body: JSON.stringify({ image: img }),
            });
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
    try {
      const res = await fetch(`${API}/products/${id}`);
      const data = await res.json();
      setSelectedProduct(data);
      setDialogOpen(true);
    } catch (err) {
      console.error("Edit error:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xoá sản phẩm này?")) return;
    try {
      await fetch(`${API}/products/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      setProducts(products.filter((p) => p.ProductID !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // 🗑️ Xoá ảnh khỏi Cloudinary + DB
  const handleDeleteVariantImage = async (variantId, imageId) => {
    if (!window.confirm("Xoá ảnh này?")) return;
    try {
      const res = await fetch(`${API}/products/images/${imageId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Xoá ảnh thất bại");
        return;
      }

      setSelectedProduct((prev) => {
        if (!prev) return prev;
        const updatedVariants = prev.variants.map((v) =>
          v.VariantID === variantId
            ? { ...v, images: v.images.filter((img) => img.ImageID !== imageId) }
            : v
        );
        return { ...prev, variants: updatedVariants };
      });
    } catch (err) {
      console.error("Delete image error:", err);
      alert("Lỗi khi xoá ảnh");
    }
  };

  const filtered = products.filter((p) => {
    const s = search.toLowerCase();
    return (
      p.ProductName?.toLowerCase().includes(s) ||
      p.SKU?.toLowerCase().includes(s) ||
      p.CategoryName?.toLowerCase().includes(s)
    );
  });
  return (
    <div className="flex min-h-screen bg-[#EDEDED]">
      <Sidebar />
      <div className="flex-1 p-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h1>
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
          </div>
        </header>

        {/* Product Table */}
        <ProductTable
          products={filtered}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Dialog */}
        <ProductDialog
          isOpen={isDialogOpen}
          onClose={() => {
            setDialogOpen(false);
            setSelectedProduct(null);
          }}
          onSubmit={handleAddOrEdit}
          categories={categories}
          initialData={selectedProduct}
          onDeleteImage={handleDeleteVariantImage}
        />
      </div>
    </div>
  );
}
