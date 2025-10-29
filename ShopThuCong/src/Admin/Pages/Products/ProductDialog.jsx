{/*File Sản Phẩm */ }

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function ProductDialog({
    isOpen,
    onClose,
    onSubmit,
    categories,
    initialData = null,
    onDeleteImage,
}) {
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
                    Specification: "",
                    Price: 0,
                    StockQuantity: 0,
                    IsActive: 1,
                    images: [],
                },
            ],
        }
    );

    useEffect(() => {
        if (initialData) setProduct(initialData);
    }, [initialData]);

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
                { SKU: "", Specification: "", Price: 0, StockQuantity: 0, IsActive: 1, images: [] },
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

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(product);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl w-[720px] max-h-[90vh] overflow-y-auto p-6 relative">
                <button onClick={onClose} className="absolute right-3 top-3 text-gray-500 hover:text-gray-700">
                    <X size={22} />
                </button>

                <h2 className="text-xl font-bold text-teal-600 mb-4">
                    {isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="Tên sản phẩm"
                        value={product.ProductName}
                        onChange={(e) => setProduct({ ...product, ProductName: e.target.value })}
                    />

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

                    <input
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="Mã SKU"
                        value={product.SKU}
                        onChange={(e) => setProduct({ ...product, SKU: e.target.value })}
                    />

                    <textarea
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="Mô tả ngắn"
                        value={product.ShortDescription}
                        onChange={(e) => setProduct({ ...product, ShortDescription: e.target.value })}
                    />

                    <input
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="Chất liệu"
                        value={product.Material}
                        onChange={(e) => setProduct({ ...product, Material: e.target.value })}
                    />

                    <textarea
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="Mô tả chi tiết"
                        value={product.Description}
                        onChange={(e) => setProduct({ ...product, Description: e.target.value })}
                    />

                    <div className="pt-4 border-t">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold">Biến thể sản phẩm</h3>
                            <button
                                type="button"
                                onClick={addVariant}
                                className="text-teal-600 font-medium hover:underline"
                            >
                                + Thêm biến thể
                            </button>
                        </div>

                        {product.variants.map((v, i) => (
                            <div key={i} className="bg-gray-50 border rounded-xl p-3 mb-3 space-y-3">
                                <div className="grid grid-cols-12 gap-3">
                                    <div className="col-span-12 md:col-span-6">
                                        <input
                                            className="w-full border rounded px-3 py-2"
                                            placeholder="SKU biến thể"
                                            value={v.SKU}
                                            onChange={(e) => handleVariantChange(i, "SKU", e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-12 md:col-span-6">
                                        <input
                                            className="w-full border rounded px-3 py-2"
                                            placeholder="Mô tả (VD: Màu đỏ - Size M)"
                                            value={v.Specification}
                                            onChange={(e) => handleVariantChange(i, "Specification", e.target.value)}
                                        />
                                    </div>

                                    <div className="col-span-6 md:col-span-3 flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full border rounded px-3 py-2 text-right"
                                            placeholder="Giá"
                                            value={v.Price}
                                            onChange={(e) => handleVariantChange(i, "Price", Number(e.target.value))}
                                        />
                                        <span className="text-gray-500">₫</span>
                                    </div>

                                    <div className="col-span-6 md:col-span-3 flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full border rounded px-3 py-2 text-right"
                                            placeholder="Tồn kho"
                                            value={v.StockQuantity}
                                            onChange={(e) =>
                                                handleVariantChange(i, "StockQuantity", Number(e.target.value))
                                            }
                                        />
                                        <span className="text-gray-500">SP</span>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <h4 className="text-sm font-semibold mb-1">Ảnh biến thể</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {v.images?.map((img, idx) => (
                                            <div
                                                key={idx}
                                                className="relative w-24 h-24 border rounded-lg overflow-hidden"
                                            >
                                                <img
                                                    src={typeof img === "string" ? img : img.ImageURL}
                                                    alt={`Ảnh ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = "https://via.placeholder.com/100?text=No+Image";
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const isDBImage = typeof img !== "string" && img.ImageID;
                                                        if (isDBImage) {
                                                            onDeleteImage?.(v.VariantID, img.ImageID);
                                                        } else {
                                                            const arr = [...product.variants];
                                                            arr[i].images.splice(idx, 1);
                                                            setProduct({ ...product, variants: arr });
                                                        }
                                                    }}
                                                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-black"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}

                                        <label className="w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-teal-400 cursor-pointer">
                                            <span className="text-3xl">＋</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleUploadImage(i, e.target.files?.[0])}
                                            />
                                        </label>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeVariant(i)}
                                    className="px-4 py-2 rounded-lg bg-red-50 hover:bg-red-200 text-red-600 font-medium transition-all"
                                >
                                    Xoá biến thể
                                </button>
                            </div>
                        ))}
                    </div>

                    <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700">
                        {isEdit ? "Lưu thay đổi" : "Lưu sản phẩm"}
                    </button>
                </form>
            </div>
        </div>
    );
}
