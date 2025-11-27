import React, { useEffect, useState } from "react";
import { Plus, Search, Settings, Pencil, Trash2 } from "lucide-react";
import Sidebar from "../Layout/Sidebar";
import ProductTable from "../Pages/Products/ProductTable";
import ProductDialog from "../Pages/Products/ProductDialog";
import {
  saveProduct,
  deleteProduct,
  saveVariant,
  deleteVariant,
  uploadVariantImage,
  deleteImage,
  createAttribute,
  updateAttribute,
  deleteAttribute,
  createAttributeValue,
  deleteAttributeValue,
} from "../Pages/Products/productService";
import axios from "axios";

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
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const axiosClient = axios.create({
    baseURL: API,
    headers: { "Content-Type": "application/json" },
  });

  // Auto gắn token
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
  /** ============ FETCH API ============ */
  const fetchCategories = async () => {
    const { data } = await axios.get(`${API}/categories`);
    setCategories(data.data || data);
  };

  const fetchProducts = async () => {
    const { data } = await axios.get(`${API}/products`);
    setProducts(data.data || data);
    setLoading(false);
  };

  const fetchAttributes = async () => {
    const { data } = await axios.get(`${API}/attributes`);
    setAttributes(data);
  };

  useEffect(() => {
    Promise.all([fetchCategories(), fetchProducts(), fetchAttributes()]);
  }, []);

  /** ============ CRUD PRODUCT ============ */
  const handleAddOrEdit = async (prod) => {
    if (!prod.CategoryID) return alert("Chưa chọn danh mục!");
    const isEdit = !!selectedProduct;
    const data = await saveProduct(prod, isEdit);
    const ProductID = data.ProductID;

    for (const v of prod.variants || []) {
      const isVarEdit = !!v.VariantID;
      const varData = await saveVariant(ProductID, v, isVarEdit);
      const variantId = varData.VariantID || v.VariantID;
      if (v.images?.length && variantId) {
        for (const img of v.images) {
          if (typeof img === "string" && img.startsWith("data:image")) {
            await uploadVariantImage(variantId, img);
          }
        }
      }
    }
    setDialogOpen(false);
    setSelectedProduct(null);
    fetchProducts();
  };

  const handleEdit = async (id) => {
    const { data } = await axios.get(`${API}/products/${id}`);
    setSelectedProduct(data);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    await deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.ProductID !== id));
  };

  const handleDeleteVariant = async (variantId, index, product, setProduct) => {
    if (variantId) await deleteVariant(variantId);
    const updated = [...product.variants];
    updated.splice(index, 1);
    setProduct({ ...product, variants: updated });
  };

  /** ============ CRUD ATTRIBUTE ============ */
  const handleAddAttribute = async () => {
    if (!newAttrName.trim()) return;
    await createAttribute(newAttrName);
    setNewAttrName("");
    fetchAttributes();
  };

  const handleDeleteAttr = async (id) => {
    await deleteAttribute(id);
    fetchAttributes();
  };

  const handleUpdateAttr = async (id, name) => {
    await updateAttribute(id, name);
    setEditingAttr(null);
    fetchAttributes();
  };

  const handleAddValue = async (AttributeID, Value) => {
    await createAttributeValue(AttributeID, Value);
    fetchAttributes();
  };

  const handleDeleteValue = async (id) => {
    await deleteAttributeValue(id);
    fetchAttributes();
  };

  const handleDeleteImage = async (variantId, imageId) => {
    await deleteImage(imageId);
  };

  /** ============ SEARCH ============ */
  const filteredProducts = products.filter((p) => {
    const keyword = search.toLowerCase().trim();
    return (
      p.ProductName?.toLowerCase().includes(keyword) ||
      p.ProductCode?.toLowerCase().includes(keyword) ||
      p.CategoryName?.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="flex min-h-screen bg-[#EDEDED]">
      <Sidebar />
      <div className="flex-1 sm:p-6 lg:p-8 p-6 min-w-0">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-teal-700 text-center md:text-left">
            Quản Lý Sản Phẩm
          </h1>
        </header>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">

          {/* SEARCH LEFT */}
          <div className="relative w-full sm:w-80">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, ProductCode hoặc danh mục…"
              className="w-full pl-9 pr-3 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white text-sm"
            />
          </div>

          {/* BUTTONS RIGHT */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAttrDialogOpen(true)}
              className="flex items-center bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-md text-sm sm:text-base"
            >
              <Settings size={18} className="mr-2" /> Thuộc tính
            </button>

            <button
              onClick={() => {
                setSelectedProduct(null);
                setDialogOpen(true);
              }}
              className="flex items-center bg-teal-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-teal-700 shadow-md text-sm sm:text-base"
            >
              <Plus size={18} className="mr-2" /> Thêm sản phẩm
            </button>
          </div>

        </div>

        <div className="overflow-x-auto min-w-0">
          <ProductTable
            products={filteredProducts}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

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
          onDeleteImage={handleDeleteImage}
          onDeleteVariant={handleDeleteVariant}
        />

        {/* ATTRIBUTE DIALOG */}
        {isAttrDialogOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-2 sm:px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full sm:w-[700px] max-h-[85vh] overflow-y-auto p-4 sm:p-6 relative">
              <button
                onClick={() => setAttrDialogOpen(false)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>

              <h2 className="text-lg sm:text-xl font-bold text-indigo-600 mb-4 text-center sm:text-left">
                Quản lý thuộc tính
              </h2>

              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <input
                  className="flex-1 border rounded-lg px-3 py-2 text-sm sm:text-base"
                  placeholder="Nhập tên thuộc tính mới"
                  value={newAttrName}
                  onChange={(e) => setNewAttrName(e.target.value)}
                />
                <button
                  onClick={handleAddAttribute}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm sm:text-base"
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
                        className="border px-2 py-1 rounded-md flex-1 text-sm sm:text-base"
                        defaultValue={a.AttributeName}
                        onBlur={(e) =>
                          handleUpdateAttr(a.AttributeID, e.target.value)
                        }
                        autoFocus
                      />
                    ) : (
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
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

                  <div className="ml-2 sm:ml-4 space-y-1">
                    {a.values?.map((v) => (
                      <div
                        key={v.AttributeValueID}
                        className="flex justify-between bg-gray-50 px-3 py-1 rounded-md text-sm sm:text-base"
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
                className="w-full mt-4 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 text-sm sm:text-base"
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
