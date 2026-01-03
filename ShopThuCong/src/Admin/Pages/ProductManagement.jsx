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

  // Dialogs
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [isAttrDialogOpen, setAttrDialogOpen] = useState(false);
  const [editingAttr, setEditingAttr] = useState(null);
  const [newAttrName, setNewAttrName] = useState("");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  //  Sidebar Mobile 
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = (state) =>
    setIsOpen(state !== undefined ? state : !isOpen);

  //  Axios Client 
  const axiosClient = axios.create({
    baseURL: API,
    headers: { "Content-Type": "application/json" },
  });

  axiosClient.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  //  Check Admin 
  if (!user || user.role !== "admin") {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 font-semibold p-6 text-center">
        Bạn không có quyền truy cập trang này.
      </div>
    );
  }

  //  FETCH 
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

  //  CRUD PRODUCT 
  const handleAddOrEdit = async (prod) => {
    if (!prod.CategoryID) return alert("Chưa chọn danh mục!");

    const isEdit = !!selectedProduct;

    const res = await saveProduct(prod, isEdit);
    const ProductID = res.ProductID;

    for (const v of prod.variants || []) {
      const isVarEdit = !!v.VariantID;
      const saved = await saveVariant(ProductID, v, isVarEdit);

      const variantId = saved.VariantID || v.VariantID;

        if (v.images?.length && variantId) {
        for (const img of v.images) {
          // chỉ upload ảnh mới (base64)
          if (typeof img === "string" && img.startsWith("data:image")) {
            await uploadVariantImage(variantId, img);
          }
        }
        v.images = [];
      }
    }

    setSelectedProduct(null);
    setDialogOpen(false);
    fetchProducts();
  };

  // EDIT
  const handleEdit = async (id) => {
    const { data } = await axios.get(`${API}/products/${id}`);
    setSelectedProduct(data);
    setDialogOpen(true);
  };

  // DELETE
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

  const handleDeleteImage = async (variantId, imageId) => {
    await deleteImage(imageId);
  };

  //  CRUD ATTRIBUTE 
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

  //  SEARCH 
  const filteredProducts = products.filter((p) => {
    const s = search.toLowerCase();
    return (
      p.ProductName?.toLowerCase().includes(s) ||
      p.ProductCode?.toLowerCase().includes(s) ||
      p.CategoryName?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">

      {/* SIDEBAR */}
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          onClick={() => toggleSidebar(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      {/* CONTENT */}
      <div className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <h1 className="text-2xl font-semibold text-teal-700 tracking-tight">
            Quản Lý Sản Phẩm
          </h1>
        </header>

        {/* SEARCH + BUTTONS */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">

          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên, mã sản phẩm hoặc danh mục…"
              className="w-full pl-10 pr-3 py-2 rounded-xl border bg-white shadow-sm
                         focus:ring-2 focus:ring-teal-500 outline-none text-sm"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAttrDialogOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 
                         text-white px-4 py-2 rounded-xl shadow-md text-sm"
            >
              <Settings size={18} /> Thuộc tính
            </button>

            <button
              onClick={() => {
                setSelectedProduct(null);
                setDialogOpen(true);
              }}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 
                         text-white px-4 py-2 rounded-xl shadow-md text-sm"
            >
              <Plus size={18} /> Thêm sản phẩm
            </button>
          </div>
        </div>

        {/* PRODUCT TABLE */}
        <div className="overflow-x-auto">
          <ProductTable
            products={filteredProducts}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        {/* PRODUCT DIALOG */}
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
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full sm:w-[700px] max-h-[90vh] overflow-y-auto p-6 relative">

              <button
                onClick={() => setAttrDialogOpen(false)}
                className="absolute right-3 top-3 text-slate-500 hover:text-red-500"
              >
                ✕
              </button>

              <h2 className="text-xl font-bold text-indigo-600 mb-4">
                Quản lý thuộc tính
              </h2>

              {/* Add Attribute */}
              <div className="flex flex-col sm:flex-row gap-2 mb-5">
                <input
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                  placeholder="Nhập tên thuộc tính mới"
                  value={newAttrName}
                  onChange={(e) => setNewAttrName(e.target.value)}
                />
                <button
                  onClick={handleAddAttribute}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm"
                >
                  + Thêm
                </button>
              </div>

              {/* Attributes List */}
              {attributes.map((a) => (
                <div
                  key={a.AttributeID}
                  className="border-b pb-4 mb-4 last:border-none"
                >
                  <div className="flex justify-between items-center mb-2">
                    {editingAttr === a.AttributeID ? (
                      <input
                        className="border px-3 py-1 rounded-md flex-1"
                        defaultValue={a.AttributeName}
                        onBlur={(e) =>
                          handleUpdateAttr(a.AttributeID, e.target.value)
                        }
                        autoFocus
                      />
                    ) : (
                      <h3 className="font-semibold text-slate-800">
                        {a.AttributeName}
                      </h3>
                    )}

                    <div className="flex gap-3">
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

                  {/* Attribute Values */}
                  <div className="ml-3 space-y-2">
                    {a.values?.map((v) => (
                      <div
                        key={v.AttributeValueID}
                        className="flex justify-between items-center bg-slate-50 px-3 py-1 rounded-md"
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

                    {/* Add Value */}
                    <div className="flex gap-2 mt-2">
                      <input
                        ref={(el) => (a.inputRef = el)}
                        className="flex-1 border rounded px-3 py-1 text-sm outline-none"
                        placeholder="Thêm giá trị…"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const val = e.target.value.trim();
                            if (val) {
                              handleAddValue(a.AttributeID, val);
                              e.target.value = "";
                            }
                          }
                        }}
                      />

                      <button
                        onClick={() => {
                          const val = a.inputRef?.value?.trim();
                          if (val) {
                            handleAddValue(a.AttributeID, val);
                            a.inputRef.value = "";
                          }
                        }}
                        className="bg-teal-600 text-white px-3 py-1 rounded-lg hover:bg-teal-700 text-sm"
                      >
                        + Giá trị
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => setAttrDialogOpen(false)}
                className="w-full mt-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
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
