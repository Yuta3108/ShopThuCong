
import React, { useEffect, useState } from "react";
import { X, Minus, Plus } from "lucide-react";
import axios from "axios";

const API = "https://backend-eta-ivory-29.vercel.app/api";

export default function QuickViewModal({ product, onClose }) {
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Fetch product detail 1 lần duy nhất khi mở popup
  useEffect(() => {
    if (!product) return;

    const fetchDetail = async () => {
      try {
        const res = await axios.get(`${API}/products/${product.ProductID}`);

        const mapped = (res.data.variants || []).map((v) => ({
          ...v,
          VariantName: v.attributes?.map((a) => a.Value).join(" / ") || "Biến thể",
        }));

        setVariants(mapped);

        // CHỈ SET selectedVariant LẦN ĐẦU
        if (!selectedVariant && mapped.length > 0) {
          setSelectedVariant(mapped[0]);
        }
      } catch (err) {
        console.error("Lỗi load biến thể:", err);
      }
    };

    fetchDetail();
  }, [product]);

  if (!product) return null;

  const handleAddToCart = async () => {
    const isDB = localStorage.getItem("cartMode") === "db" &&
                 !!localStorage.getItem("token");

    if (!selectedVariant) {
      alert("Vui lòng chọn biến thể!");
      return;
    }

    // -------------------
    // LOCAL CART
    // -------------------
    if (!isDB) {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];

      const existing = cart.find(
        (i) => i.VariantID === selectedVariant.VariantID
      );

      if (existing) existing.quantity += quantity;
      else {
        cart.push({
          key: selectedVariant.VariantID,
          ProductID: product.ProductID,
          VariantID: selectedVariant.VariantID,
          ProductName: product.ProductName,
          ImageURL: product.ImageURL,
          quantity,
          price: selectedVariant.Price,
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      alert("Đã thêm vào giỏ hàng!");
      onClose();
      return;
    }

    // -------------------
    // DATABASE CART
    // -------------------
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

    alert("Đã thêm vào giỏ hàng!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">
      <div className="bg-white max-w-4xl w-full rounded-xl p-6 shadow-lg relative animate-fadeIn">

        <button onClick={onClose} className="absolute top-4 right-4">
          <X size={24} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* IMAGE */}
          <img
            src={product.ImageURL}
            alt=""
            className="rounded-xl w-full object-cover"
          />

          {/* INFO */}
          <div>
            <h2 className="text-xl font-semibold">{product.ProductName}</h2>

            <p className="text-[#C2185B] text-2xl font-bold mt-2">
              {Number(product.minPrice).toLocaleString()}₫
            </p>

            {/* VARIANTS */}
            <div className="mt-4">
              <p className="font-semibold mb-1">Biến thể:</p>

              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.VariantID}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-lg border transition ${
                      selectedVariant?.VariantID === v.VariantID
                        ? "bg-[#C2185B] text-white border-[#C2185B]"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {v.VariantName}
                  </button>
                ))}
              </div>
            </div>

            {/* QUANTITY */}
            <div className="mt-6">
              <p className="font-semibold mb-1">Số lượng:</p>

              <div className="flex items-center gap-3">
                <button
                  className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center"
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                >
                  <Minus size={16} />
                </button>

                <span className="w-10 text-center font-semibold">{quantity}</span>

                <button
                  className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* ADD BUTTON */}
            <button
              onClick={handleAddToCart}
              className="mt-6 w-full py-3 bg-[#C2185B] text-white rounded-xl text-lg font-semibold"
            >
              Thêm vào giỏ hàng
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
