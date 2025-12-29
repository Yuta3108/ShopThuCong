import React, { useEffect, useState } from "react";
import { X, Info } from "lucide-react";
import Swal from "sweetalert2";
import { Loader2 } from "lucide-react";

/*  FORMAT MONEY  */
const formatMoney = (value) =>
  new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const parseMoneyInput = (value) =>
  Number(String(value).replace(/[^\d]/g, "")) || 0;

/* UPLOAD PRODUCT IMAGE  */
const handleUploadProductImage = (file, product, setProduct) => {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    setProduct({ ...product, ImageURL: reader.result });
  };
  reader.readAsDataURL(file);
};

export default function ProductDialog({
  isOpen,
  onClose,
  onSubmit,
  categories,
  attributes = [],
  initialData = null,
  onDeleteImage,
  onDeleteVariant,
}) {
  const [isSaving, setIsSaving] = useState(false);
  const isEdit = !!initialData;

  const [product, setProduct] = useState(
    initialData || {
      CategoryID: "",
      ProductCode: "",
      ProductName: "",
      ShortDescription: "",
      Material: "",
      Description: "",
      IsActive: 1,
      variants: [
        {
          ProductCode: "",
          Price: 0,
          StockQuantity: 0,
          IsActive: 1,
          images: [],
          attributeValueIds: [],
        },
      ],
    }
  );

  useEffect(() => {
    if (!initialData) resetForm();
  }, [initialData, isOpen]);

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
              if (matchedValue)
                attrValueIds.push(matchedValue.AttributeValueID);
            }
          }
        }

        return {
          ...v,
          images: v.images || [],
          attributeValueIds: attrValueIds,
        };
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
          ProductCode: "",
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

  /*  hàm upload ảnh  */
  const handleUploadImage = (i, file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProduct((prev) => {
        const variants = prev.variants.map((v, idx) => {
          if (idx !== i) return v;

          return {
            ...v,
            images: [...(v.images || []), reader.result], // base64
          };
        });

        return { ...prev, variants };
      });
    };
    reader.readAsDataURL(file);
  };

  const canDeleteVariant = (createdAt, variantId) => {
    if (!variantId) return true;
    if (!createdAt) return false;

    const created = new Date(createdAt).getTime();
    const now = Date.now();
    const diffMinutes = (now - created) / (1000 * 60);

    return diffMinutes <= 30;
  };

  const handleSelectDropdown = (i, attr, value) => {
    const updated = [...product.variants];
    const currentIds = updated[i].attributeValueIds || [];

    const filteredIds = currentIds.filter(
      (id) => !attr.values.some((v) => v.AttributeValueID === id)
    );

    if (value) filteredIds.push(Number(value));

    updated[i].attributeValueIds = filteredIds;
    setProduct({ ...product, variants: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    if(!product.CategoryID){
      Swal.fire({
        icon: "warning",
        title: "Chưa chọn danh mục",
        text: "Vui lòng chọn danh mục sản phẩm",
      });
      setIsSaving(false);
      return;
    }
    if(!product.ProductName || product.ProductName.trim() === ""){
      Swal.fire({
        icon: "warning",
        title: "Chưa nhập tên sản phẩm",
        text: "Vui lòng nhập tên sản phẩm",
      });
      setIsSaving(false);
      return;
    }
    if(!product.ProductCode || product.ProductCode.trim() === ""){
      Swal.fire({
        icon: "warning",
        title: "Chưa nhập mã sản phẩm",
        text: "Vui lòng nhập mã sản phẩm",
      });
      setIsSaving(false);
      return;
    }
    if(product.variants.length === 0){
      Swal.fire({
        icon: "warning",
        title: "Chưa có biến thể",
        text: "Vui lòng thêm ít nhất một biến thể cho sản phẩm",
      });
      setIsSaving(false);
      return;
    }
    if(product.variants.some(v => !v.Price || v.Price <= 0)){
      Swal.fire({
        icon: "warning",
        title: "Giá biến thể không hợp lệ",
        text: "Vui lòng kiểm tra lại giá của các biến thể",
      });
      setIsSaving(false);
      return;
    }
    // Hiển thị loading Swal
    Swal.fire({
      title: "Đang xử lý...",
      text: "Vui lòng chờ một chút nhé ",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const cleanVariants = product.variants.map((v) => ({
        ...v,
        attributeValueIds: (v.attributeValueIds || []).filter(Boolean),
      }));

      await onSubmit({ ...product, variants: cleanVariants });

      Swal.fire({
        icon: "success",
        title: "Thành công ",
        text: isEdit ? "Đã cập nhật sản phẩm" : "Đã thêm sản phẩm mới",
        timer: 1500,
        showConfirmButton: false,
      });

      resetForm();
      onClose();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi ",
        text: "Bạn Nhập Trùng ProductCode Hoặc Lỗi Kỹ Thuật, vui lòng thử lại",
        confirmButtonText: "OK",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setProduct({
      CategoryID: "",
      ProductCode: "",
      ProductName: "",
      ShortDescription: "",
      Material: "",
      Description: "",
      IsActive: 1,
      variants: [
        {
          ProductCode: "",
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
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
        >
          <X size={22} />
        </button>

        <h2 className="text-lg sm:text-xl font-bold text-teal-600 mb-4 mt-1">
          {isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* BASIC INFO */}
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Tên sản phẩm"
            value={product.ProductName}
            onChange={(e) =>
              setProduct({ ...product, ProductName: e.target.value })
            }
          />

          {/* CATEGORY */}
          <select
            className="w-full border rounded-lg px-3 py-2 bg-white"
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

          {/* PRODUCT CODE */}
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Mã ProductCode"
            value={product.ProductCode}
            onChange={(e) =>
              setProduct({ ...product, ProductCode: e.target.value })
            }
          />
          <textarea
            className="w-full border rounded-lg px-3 py-2"
            rows={2}
            placeholder="Mô tả ngắn"
            value={product.ShortDescription}
            onChange={(e) =>
              setProduct({ ...product, ShortDescription: e.target.value })
            }
          />

          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Chất liệu"
            value={product.Material}
            onChange={(e) =>
              setProduct({ ...product, Material: e.target.value })
            }
          />

          <textarea
            className="w-full border rounded-lg px-3 py-2"
            rows={3}
            placeholder="Mô tả chi tiết"
            value={product.Description}
            onChange={(e) =>
              setProduct({ ...product, Description: e.target.value })
            }
          />

          {/*  STATUS  */}
          <div>
            <label className="text-sm font-medium">Tình trạng</label>
            <select
              className="w-full border rounded-lg px-3 py-2 bg-white"
              value={product.IsActive}
              onChange={(e) =>
                setProduct({ ...product, IsActive: Number(e.target.value) })
              }
            >
              <option value={1}>Đang bán</option>
              <option value={0}>Ngừng bán</option>
            </select>
          </div>

          {/* PRODUCT IMAGE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ảnh đại diện
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {product.ImageURL && (
                <div className="relative w-24 h-24 border rounded-lg overflow-hidden">
                  <img
                    src={product.ImageURL}
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
                  className="hidden"
                  accept="image/*"
                  onChange={(e) =>
                    handleUploadProductImage(
                      e.target.files?.[0],
                      product,
                      setProduct
                    )
                  }
                />
              </label>
            </div>
          </div>

          {/* BIẾN THỂ */}
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Biến thể sản phẩm</h3>

              <button
                type="button"
                onClick={addVariant}
                className="text-teal-600 hover:underline text-sm"
              >
                + Thêm biến thể
              </button>
            </div>

            {product.variants.map((v, i) => (
              <div
                key={i}
                className="bg-gray-50 border rounded-xl p-4 mb-3 space-y-3"
              >
                {/* PRICE + STOCK */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* GIÁ */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                      Giá (₫)
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      className="w-full border rounded-lg px-3 py-2 text-right
                 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500
                 placeholder:text-gray-400"
                      placeholder="VD: 120.000"
                      value={v.Price ? formatMoney(v.Price) : ""}
                      onChange={(e) =>
                        handleVariantChange(
                          i,
                          "Price",
                          parseMoneyInput(e.target.value)
                        )
                      }
                    />
                  </div>

                  {/* SỐ LƯỢNG */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                      Số lượng
                    </label>

                    <input
                      type="number"
                      min="0"
                      className="w-full border rounded-lg px-3 py-2 text-right
                      focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500
                      placeholder:text-gray-400"
                      placeholder="VD: 50"
                      value={v.StockQuantity || ""}
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

                {/* ATTRIBUTES */}
                <div>
                  {attributes.map((attr) => {
                    const selected =
                      attr.values.find((x) =>
                        v.attributeValueIds?.includes(x.AttributeValueID)
                      )?.AttributeValueID || "";

                    return (
                      <div key={attr.AttributeID} className="mb-3">
                        <label className="text-sm text-gray-600">
                          {attr.AttributeName}
                        </label>

                        <select
                          className="w-full border rounded-lg px-3 py-2 bg-white mt-1"
                          value={selected}
                          onChange={(e) =>
                            handleSelectDropdown(
                              i,
                              attr,
                              e.target.value
                                ? Number(e.target.value)
                                : null
                            )
                          }
                        >
                          <option value="">
                            -- Chọn {attr.AttributeName} --
                          </option>
                          {attr.values.map((val) => (
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

                {/* VARIANT IMAGES */}
                <div>
                  <h4 className="text-sm font-semibold mb-1">Ảnh biến thể</h4>
                  <div className="flex flex-wrap gap-3">
                    {v.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative w-20 h-20 border rounded-lg overflow-hidden"
                      >
                        <img
                          src={typeof img === "string" ? img : img.ImageURL}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const arr = [...product.variants];
                            arr[i].images.splice(idx, 1);
                            setProduct({ ...product, variants: arr });
                          }}
                          className="absolute top-1 right-1 bg-black/50 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    <label className="w-20 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-teal-400 cursor-pointer">
                      <span className="text-2xl">＋</span>
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

                {/* REMOVE VARIANT */}
                {(() => {
                  const allowDelete = canDeleteVariant(
                    v.CreatedAt,
                    v.VariantID
                  );

                  return (
                    <button
                      type="button"
                      disabled={!allowDelete}
                      onClick={() =>
                        allowDelete &&
                        (v.VariantID
                          ? onDeleteVariant(
                            v.VariantID,
                            i,
                            product,
                            setProduct
                          )
                          : removeVariant(i))
                      }
                      className={`w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-medium
                        ${allowDelete
                          ? "bg-red-50 hover:bg-red-100 text-red-600"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }
                      `}
                    >
                      Xóa biến thể
                    </button>
                  );
                })()}
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className={`w-full py-2 rounded-lg text-white flex items-center justify-center gap-2 transition ${isSaving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-teal-600 hover:bg-teal-700"
              }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              isEdit ? "Lưu thay đổi" : "Lưu sản phẩm"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
