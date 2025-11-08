import React, { useEffect, useState } from "react";
import { X, Info } from "lucide-react";

export default function ProductDialog({
  isOpen,
  onClose,
  onSubmit,
  categories,
  attributes = [],
  initialData = null,
  onDeleteImage,
}) {
  const [isSaving, setIsSaving] = useState(false);
  const isEdit = !!initialData;
  const [product, setProduct] = useState(
    initialData || {
      CategoryID: "",
      SKU: "",
      ProductName: "",
      ShortDescription: "",
      Material: "",
      Description: "",
      IsActive: 1,
      variants: [
        {
          SKU: "",
          Price: 0,
          StockQuantity: 0,
          IsActive: 1,
          images: [],
          attributeValueIds: [],
        },
      ],
    }
  );

  // Cập nhật variant khi edit
  useEffect(() => {
    if (initialData) {
      const updatedVariants = (initialData.variants || []).map((v) => {
        const attrValueIds = [];
        if (v.attributes && attributes.length > 0) {
          for (const a of v.attributes) {
            const matchedAttr = attributes.find(
              (x) => x.AttributeName === a.AttributeName
            );
            if (matchedAttr) {
              const matchedValue = matchedAttr.values?.find(
                (vv) => vv.Value === a.Value
              );
              if (matchedValue) attrValueIds.push(matchedValue.AttributeValueID);
            }
          }
        }
        return { ...v, attributeValueIds: attrValueIds };
      });
      setProduct({ ...initialData, variants: updatedVariants });
    }
  }, [initialData, attributes]);

  const handleVariantChange = (i, key, value) => {
    const updated = [...product.variants];
    updated[i][key] = value;
    setProduct({ ...product, variants: updated });
  };

  const addVariant = () => {
    setProduct({
      ...product,
      variants: [
        ...product.variants,
        {
          SKU: "",
          Price: 0,
          StockQuantity: 0,
          IsActive: 1,
          images: [],
          attributeValueIds: [],
        },
      ],
    });
  };

  const removeVariant = (i) => {
    const updated = [...product.variants];
    updated.splice(i, 1);
    setProduct({ ...product, variants: updated });
  };

  const handleUploadImage = (i, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const updated = [...product.variants];
      updated[i].images = [...(updated[i].images || []), reader.result];
      setProduct({ ...product, variants: updated });
    };
    reader.readAsDataURL(file);
  };

  const handleSelectDropdown = (variantIndex, attr, selectedId) => {
    const updated = [...product.variants];
    const currentIds = updated[variantIndex].attributeValueIds || [];
    const filteredIds = currentIds.filter(
      (id) => !attr.values.some((v) => v.AttributeValueID === id)
    );
    if (selectedId) filteredIds.push(Number(selectedId));
    updated[variantIndex].attributeValueIds = filteredIds;
    setProduct({ ...product, variants: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    const cleanVariants = product.variants.map((v) => ({
      ...v,
      attributeValueIds: (v.attributeValueIds || []).filter(Boolean),
    }));
    await onSubmit({ ...product, variants: cleanVariants });
    resetForm();
    setIsSaving(false);
  };

  const resetForm = () => {
    setProduct({
      CategoryID: "",
      SKU: "",
      ProductName: "",
      ShortDescription: "",
      Material: "",
      Description: "",
      IsActive: 1,
      variants: [
        {
          SKU: "",
          Price: 0,
          StockQuantity: 0,
          IsActive: 1,
          images: [],
          attributeValueIds: [],
        },
      ],
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-2 sm:px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full sm:w-[720px] max-h-[90vh] overflow-y-auto p-4 sm:p-6 relative">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
        >
          <X size={22} />
        </button>

        {/* Tiêu đề */}
        <h2 className="text-lg sm:text-xl font-bold text-teal-600 mb-4 mt-1 text-center sm:text-left">
          {isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ===== Thông tin sản phẩm ===== */}
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm sm:text-base"
            placeholder="Tên sản phẩm"
            value={product.ProductName}
            onChange={(e) =>
              setProduct({ ...product, ProductName: e.target.value })
            }
          />

          <select
            className="w-full border rounded-lg px-3 py-2 bg-white text-sm sm:text-base"
            value={product.CategoryID || ""}
            onChange={(e) =>
              setProduct({
                ...product,
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

          <input
            className="w-full border rounded-lg px-3 py-2 text-sm sm:text-base"
            placeholder="Mã SKU sản phẩm"
            value={product.SKU}
            onChange={(e) => setProduct({ ...product, SKU: e.target.value })}
          />
          <p className="text-xs text-gray-500 italic -mt-2">
            SKU sản phẩm phải duy nhất trong toàn hệ thống.
          </p>
            {/* ===== Ảnh đại diện sản phẩm ===== */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ảnh đại diện
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {product.ImageURL && (
                <div className="relative w-24 h-24 border rounded-lg overflow-hidden">
                  <img
                    src={product.ImageURL}
                    alt="Ảnh đại diện"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setProduct({ ...product, ImageURL: "" })}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                </div>
              )}
              <label className="w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-teal-400 cursor-pointer">
                <span className="text-2xl">＋</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () =>
                      setProduct({ ...product, ImageURL: reader.result });
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            </div>
          </div>
          <textarea
            className="w-full border rounded-lg px-3 py-2 text-sm sm:text-base"
            placeholder="Mô tả ngắn"
            rows={2}
            value={product.ShortDescription}
            onChange={(e) =>
              setProduct({ ...product, ShortDescription: e.target.value })
            }
          />

          <input
            className="w-full border rounded-lg px-3 py-2 text-sm sm:text-base"
            placeholder="Chất liệu"
            value={product.Material}
            onChange={(e) => setProduct({ ...product, Material: e.target.value })}
          />

          <textarea
            className="w-full border rounded-lg px-3 py-2 text-sm sm:text-base"
            placeholder="Mô tả chi tiết"
            rows={3}
            value={product.Description}
            onChange={(e) =>
              setProduct({ ...product, Description: e.target.value })
            }
          />

          {/* ===== Tình trạng ===== */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tình trạng
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2 bg-white text-sm sm:text-base"
              value={product.IsActive}
              onChange={(e) =>
                setProduct({ ...product, IsActive: parseInt(e.target.value) })
              }
            >
              <option value={1}>Đang bán</option>
              <option value={0}>Ngừng bán</option>
            </select>
          </div>

          {/* ===== Biến thể sản phẩm ===== */}
          <div className="pt-4 border-t">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
              <h3 className="text-base sm:text-lg font-semibold">
                Biến thể sản phẩm
              </h3>
              <button
                type="button"
                onClick={addVariant}
                className="text-teal-600 font-medium hover:underline text-sm sm:text-base"
              >
                + Thêm biến thể
              </button>
            </div>

            {product.variants.map((v, i) => (
              <div
                key={i}
                className="bg-gray-50 border rounded-xl p-3 sm:p-4 mb-3 space-y-3"
              >
                {isEdit && v.SKU && (
                  <p className="text-sm text-teal-700 font-semibold">
                    SKU: <span className="text-gray-700">{v.SKU}</span>
                    <Info
                      size={14}
                      className="inline ml-1 text-gray-400"
                      title="SKU tự động được sinh bởi hệ thống"
                    />
                  </p>
                )}

                {/* Giá & Tồn kho */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-600">Giá</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full border rounded px-3 py-2 text-right text-sm sm:text-base"
                      placeholder="Giá"
                      value={v.Price}
                      onChange={(e) =>
                        handleVariantChange(i, "Price", Number(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Tồn kho</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full border rounded px-3 py-2 text-right text-sm sm:text-base"
                      placeholder="Số lượng"
                      value={v.StockQuantity}
                      onChange={(e) =>
                        handleVariantChange(
                          i,
                          "StockQuantity",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                </div>

                {/* Thuộc tính */}
                <div className="pt-2">
                  <h4 className="text-sm font-semibold mb-1 text-gray-700">
                    Thuộc tính
                  </h4>
                  {attributes.map((attr) => {
                    const currentValue =
                      attr.values?.find((val) =>
                        v.attributeValueIds?.includes(val.AttributeValueID)
                      )?.AttributeValueID || "";

                    return (
                      <div key={attr.AttributeID} className="mb-3">
                        <label className="block text-sm text-gray-600 mb-1">
                          {attr.AttributeName}
                        </label>
                        <select
                          className="w-full border rounded-lg px-3 py-2 bg-white text-sm sm:text-base"
                          value={currentValue}
                          onChange={(e) =>
                            handleSelectDropdown(
                              i,
                              attr,
                              e.target.value ? Number(e.target.value) : null
                            )
                          }
                        >
                          <option value="">
                            -- Chọn {attr.AttributeName} --
                          </option>
                          {attr.values?.map((val) => (
                            <option
                              key={val.AttributeValueID}
                              value={val.AttributeValueID}
                            >
                              {val.Value}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>

                {/* Ảnh biến thể */}
                <div className="pt-2">
                  <h4 className="text-sm font-semibold mb-1">Ảnh biến thể</h4>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {v.images?.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative w-20 h-20 sm:w-24 sm:h-24 border rounded-lg overflow-hidden"
                      >
                        <img
                          src={typeof img === "string" ? img : img.ImageURL}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const isDB =
                              typeof img !== "string" && img.ImageID;
                            if (isDB) {
                              onDeleteImage?.(v.VariantID, img.ImageID).then(() => {
                                const arr = [...product.variants];
                                arr[i].images = arr[i].images.filter((im, k) => k !== idx);
                                setProduct({ ...product, variants: arr });
                              });
                            }
                            else {
                              const arr = [...product.variants];
                              arr[i].images.splice(idx, 1);
                              setProduct({ ...product, variants: arr });
                            }
                          }}
                          className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <label className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-teal-400 cursor-pointer">
                      <span className="text-2xl sm:text-3xl">＋</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleUploadImage(i, e.target.files?.[0])
                        }
                      />
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-red-50 hover:bg-red-200 text-red-600 font-medium text-sm sm:text-base"
                >
                  Xoá biến thể
                </button>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className={`w-full py-2 rounded-lg text-white transition text-sm sm:text-base ${
              isSaving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-teal-600 hover:bg-teal-700"
            }`}
          >
            {isSaving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Lưu sản phẩm"}
          </button>
        </form>
      </div>
    </div>
  );
}
