import React, { useEffect, useState } from "react";
import { X, Minus, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

const API = "https://backend-eta-ivory-29.vercel.app/api";

export default function QuickViewModal({ product, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!product?.ProductID) return;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/products/${product.ProductID}`);
        const data = res.data;

        setDetails(data);

        const mapped = data.variants.map((v) => ({
          ...v,
          VariantName: v.attributes?.map((a) => a.Value).join(" - "),
        }));

        setSelectedVariant((prev) => prev ?? mapped[0]);
      } catch (e) {
        console.error("Lỗi load popup:", e);
      }
      setLoading(false);
    };

    fetchDetail();
  }, [product?.ProductID]);

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      alert("Vui lòng chọn biến thể!");
      return;
    }

    const isDB =
      localStorage.getItem("cartMode") === "db" &&
      !!localStorage.getItem("token");

    if (!isDB) {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];

      const existing = cart.find(
        (i) => i.VariantID === selectedVariant.VariantID
      );

      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.push({
          key: selectedVariant.VariantID,
          ProductID: details.ProductID,
          VariantID: selectedVariant.VariantID,
          ProductName: details.ProductName,
          ImageURL:
            selectedVariant?.images?.[0]?.ImageURL || details.ImageURL,
          quantity,
          price: Number(selectedVariant.Price),
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("updateCart"));
      alert("Đã thêm vào giỏ hàng!");
      onClose();
      return;
    }

    await axios.post(
      `${API}/cart/add`,
      {
        variantId: selectedVariant.VariantID,
        quantity,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    window.dispatchEvent(new Event("updateCart"));
    alert("Đã thêm vào giỏ hàng!");
    onClose();
  };

  if (loading || !details) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 px-4">
        <div className="bg-white rounded-3xl w-full max-w-5xl p-6 shadow-2xl animate-luxury">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
            <div className="bg-slate-100 h-[320px] rounded-2xl" />
            <div className="space-y-4">
              <div className="h-5 bg-slate-100 w-2/3 rounded" />
              <div className="h-5 bg-slate-100 w-1/3 rounded" />
              <div className="h-9 bg-slate-100 w-1/2 rounded" />
              <div className="h-9 bg-slate-100 w-full rounded" />
              <div className="h-9 bg-slate-100 w-full rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stock = selectedVariant?.StockQuantity ?? 0;
  const currentPrice = Number(
    selectedVariant?.Price || details.minPrice || 0
  );

  return (
    <div className="fixed inset-0 bg-black/35 backdrop-blur-sm flex justify-center items-center px-4 z-50">
      <div className="relative bg-white max-w-5xl w-full rounded-3xl p-7 md:p-8 shadow-[0_22px_60px_rgba(15,23,42,0.35)] animate-luxury">
        {/* close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 transition"
        >
          <X size={24} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          {/* IMAGE */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-md">
              <img
                src={
                  (selectedVariant?.images?.[0]?.ImageURL ||
                    details.ImageURL) ??
                  "https://placehold.co/500x500"
                }
                className="w-full h-[360px] md:h-[360px] object-cover"
                alt={details.ProductName}
              />
            </div>
          </div>

          {/* RIGHT INFO */}
          <div className="flex flex-col">
            <h2 className="text-[22px] md:text-[24px] font-semibold text-slate-900 leading-snug">
              {details.ProductName}
            </h2>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span>
                Mã SP:{" "}
                <b className="text-slate-800">{details.ProductCode}</b>
              </span>
              <span className="w-[1px] h-3 bg-slate-200" />
              <span>
                Danh mục:{" "}
                <b className="text-slate-800">{details.CategoryName}</b>
              </span>
            </div>

            {/* PRICE */}
            <p className="text-[30px] md:text-[32px] font-bold text-rose-500 mt-4 tracking-tight">
              {currentPrice.toLocaleString()}₫
            </p>

            {/* VARIANTS */}
            <div className="mt-6">
              <p className="text-sm font-medium text-slate-800 mb-2">
                Thuộc tính
              </p>
              <div className="flex flex-wrap gap-2">
                {details.variants.map((v) => {
                  const isActive =
                    selectedVariant?.VariantID === v.VariantID;
                  const outOfStock = v.StockQuantity === 0;

                  return (
                    <button
                      key={v.VariantID}
                      onClick={() => !outOfStock && setSelectedVariant(v)}
                      className={`
                        px-3.5 py-2 rounded-full border text-xs md:text-sm transition
                        ${
                          isActive
                            ? "border-rose-500 bg-rose-50 text-rose-600 shadow-sm"
                            : "border-slate-300 text-slate-700 hover:border-rose-400 hover:text-rose-500"
                        }
                        ${
                          outOfStock
                            ? "opacity-40 cursor-not-allowed hover:border-slate-300 hover:text-slate-700"
                            : ""
                        }
                      `}
                    >
                      {v.attributes.map((a) => a.Value).join(" / ")}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STOCK */}
            <p className="mt-4 text-sm text-slate-700">
              Tình trạng:{" "}
              {stock > 0 ? (
                <span className="font-medium text-emerald-600 line-through decoration-transparent">
                  <span className="font-medium text-rose-500">
                    Còn hàng
                  </span>
                </span>
              ) : (
                <span className="font-medium text-rose-500">Hết hàng</span>
              )}
            </p>

            {/* QUANTITY */}
            <div className="mt-6">
              <p className="text-sm font-medium text-slate-800 mb-2">
                Số lượng
              </p>
              <div className="flex items-center gap-5">
                <button
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200"
                >
                  <Minus size={16} className="text-slate-700" />
                </button>
                <span className="text-lg font-semibold text-slate-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200"
                >
                  <Plus size={16} className="text-slate-700" />
                </button>
              </div>
            </div>

            {/* ADD CART */}
            <button
              onClick={handleAddToCart}
              disabled={stock === 0}
              className={`
                w-full mt-7 py-3 rounded-full text-[14px] font-semibold transition
                ${
                  stock === 0
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-rose-500 text-white hover:bg-rose-600 shadow-md hover:shadow-lg"
                }
              `}
            >
              {stock === 0 ? "HẾT HÀNG" : "THÊM VÀO GIỎ HÀNG"}
            </button>

            <Link
              to={`/chi-tiet/${details.ProductID}`}
              className="mt-4 text-center text-sm text-rose-500 underline underline-offset-4 hover:text-rose-600"
            >
              Xem chi tiết sản phẩm →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
