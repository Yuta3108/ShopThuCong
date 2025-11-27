import React, { useEffect, useState } from "react";
import { X, Minus, Plus } from "lucide-react";
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

        setSelectedVariant(prev => prev ?? mapped[0]);
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
        <div className="bg-white rounded-2xl w-full max-w-5xl p-6 shadow-2xl animate-luxury">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
            <div className="bg-gray-100 h-[340px] rounded-xl"></div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-100 w-2/3 rounded"></div>
              <div className="h-6 bg-gray-100 w-1/3 rounded"></div>
              <div className="h-10 bg-gray-100 w-1/2 rounded"></div>
              <div className="h-10 bg-gray-100 w-full rounded"></div>
              <div className="h-10 bg-gray-100 w-full rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stock = selectedVariant?.StockQuantity ?? 0;
  const currentPrice = Number(selectedVariant?.Price || details.minPrice || 0);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center px-4 z-50">
      <div className="bg-white max-w-5xl w-full rounded-lg p-8 shadow-2xl relative animate-luxury">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-[#C2185B] transition"
        >
          <X size={26} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* IMAGE */}
          <div>
            <img
              src={
                selectedVariant?.images?.[0]?.ImageURL || details.ImageURL
              }
              className="rounded-lg w-full object-cover shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
            />
          </div>

          {/* RIGHT INFO */}
          <div className="flex flex-col">

            <h2 className="text-[22px] font-semibold text-gray-900 leading-snug">
              {details.ProductName}
            </h2>

            <div className="text-sm text-gray-600 mt-2">
              Mã SP: <b className="text-gray-800">{details.ProductCode}</b>
            </div>

            <div className="text-sm text-gray-600">
              Danh mục: <b className="text-gray-800">{details.CategoryName}</b>
            </div>

            {/* PRICE */}
            <p className="text-[32px] font-bold text-[#C2185B] mt-4 tracking-tight">
              {currentPrice.toLocaleString()}₫
            </p>

            {/* VARIANTS */}
            <div className="mt-8">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Biến thể
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
                        px-4 py-[10px] rounded-md border text-sm transition
                        ${
                          isActive
                            ? "border-[#C2185B] bg-[#C2185B] text-white"
                            : "border-gray-300 text-gray-700 hover:border-[#C2185B]"
                        }
                        ${
                          outOfStock
                            ? "opacity-40 cursor-not-allowed hover:border-gray-300"
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
            <p className="mt-4 text-sm text-gray-700">
              Tình trạng:{" "}
              {stock > 0 ? (
                <span className="font-medium text-green-600">
                  Còn hàng ({stock})
                </span>
              ) : (
                <span className="font-medium text-red-600">Hết hàng</span>
              )}
            </p>

            {/* QUANTITY */}
            <div className="mt-8">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Số lượng
              </p>

              <div className="flex items-center gap-5">
                <button
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                >
                  <Minus size={16} />
                </button>

                <span className="text-lg font-semibold">{quantity}</span>

                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* ADD CART */}
            <button
              onClick={handleAddToCart}
              disabled={stock === 0}
              className={`
                w-full mt-8 py-3 rounded-md text-[15px] font-semibold transition
                ${
                  stock === 0
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-[#C2185B] text-white hover:bg-[#a4164b]"
                }
              `}
            >
              {stock === 0 ? "HẾT HÀNG" : "THÊM VÀO GIỎ HÀNG"}
            </button>

            <a
              href={`/chi-tiet-san-pham/${details.ProductID}`}
              className="mt-4 text-center text-sm text-[#C2185B] underline hover:text-[#a4164b]"
            >
              Xem chi tiết sản phẩm →
            </a>

          </div>
        </div>
      </div>
    </div>
  );
}
