import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../../Layout/Header";
import Footer from "../../Layout/Footer";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function ProductDetailPage() {
  const { categorySlug, productCode } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        //  Load product detail theo slug + code
        const { data } = await axios.get(
          `${API}/products/${categorySlug}/${productCode}`
        );

        setProduct(data);

        const firstVariant = data?.variants?.[0] || null;
        setSelectedVariant(firstVariant);

        const firstImage =
          firstVariant?.images?.[0]?.ImageURL || data.ImageURL;
        setMainImage(firstImage);

        //  Load related products cùng category
        const relatedRes = await axios.get(
          `${API}/products?categoryId=${data.CategoryID}`
        );

        const filtered = relatedRes.data.filter(
          (item) => item.ProductID !== data.ProductID
        );

        setRelatedProducts(filtered.slice(0, 10));
      } catch (err) {
        console.error("Load product error:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (categorySlug && productCode) {
      loadProduct();
    }
  }, [categorySlug, productCode]);

  if (loading)
    return (
      <div className="bg-[#F5F5F5] min-h-screen">
        <Header />
        <p className="text-center py-10 text-slate-500">Đang tải…</p>
      </div>
    );

  if (!product)
    return (
      <div className="bg-[#F5F5F5] min-h-screen">
        <Header />
        <p className="text-center py-10 text-slate-500">
          Không tìm thấy sản phẩm.
        </p>
      </div>
    );

  const p = product;
  const finalPrice = Number(selectedVariant?.Price || p.minPrice);

  const thumbnails = [
    { ImageURL: p.ImageURL },
    ...p.variants.flatMap((v) => v.images),
  ];

  const addToCart = async () => {
    const isDB = localStorage.getItem("cartMode") === "db";
    const token = localStorage.getItem("token");

    if (!selectedVariant) {
      alert("Vui lòng chọn biến thể!");
      return;
    }

    if (!isDB) {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      const key = selectedVariant.VariantID;

      const existing = cart.find((i) => i.key === key);

      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.push({
          key,
          ProductID: product.ProductID,
          VariantID: selectedVariant.VariantID,
          ProductName: product.ProductName,
          ProductCode: product.ProductCode,
          ImageURL: mainImage,
          quantity,
          price: finalPrice,
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("updateCart"));
      alert("Đã thêm vào giỏ hàng!");
      return;
    }

    await fetch("http://localhost:5000/api/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        variantId: selectedVariant.VariantID,
        quantity,
      }),
    });
    window.dispatchEvent(new Event("updateCart"));
    alert("Đã thêm vào giỏ hàng!");
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      <Header />

      {/* BREADCRUMB */}
      <div className="max-w-6xl mx-auto px-4 py-4 text-sm text-slate-600 flex items-center gap-2 flex-wrap">
        <Link to="/" className="hover:text-rose-500">
          Trang chủ
        </Link>
        <span className="text-slate-400">›</span>

        <Link to="/san-pham" className="hover:text-rose-500">
          Tất cả sản phẩm
        </Link>
        <span className="text-slate-400">›</span>

        <Link
          to={`/san-pham/${categorySlug}`}
          className="hover:text-rose-500"
        >
          {p.CategoryName}
        </Link>
        <span className="text-slate-400">›</span>

        <span className="text-rose-500 font-semibold line-clamp-1">
          {p.ProductName}
        </span>
      </div>

      {/* MAIN DETAIL */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-[1.15fr,0.95fr] gap-10">
          {/* LEFT – IMAGE GALLERY */}
          <div>
            <div className="w-full mb-4 rounded-3xl overflow-hidden bg-white shadow-[0_14px_30px_rgba(15,23,42,0.08)] border border-slate-200">
              <img
                src={mainImage}
                alt={p.ProductName}
                className="w-full h-[420px] object-cover"
              />
            </div>

            <div className="flex gap-3 overflow-x-auto py-2 justify-start">
              {thumbnails.map((img, i) => (
                <button
                  key={i}
                  className="shrink-0"
                  onClick={() => setMainImage(img.ImageURL)}
                >
                  <img
                    src={img.ImageURL}
                    className={`w-20 h-20 object-cover rounded-xl border transition-all
                      ${
                        mainImage === img.ImageURL
                          ? "border-rose-500 scale-105 shadow-md"
                          : "border-slate-300 hover:border-rose-400"
                      }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT – INFO PANEL (STICKY) */}
          <div className="md:sticky md:top-24 self-start">
            <div className="bg-white rounded-3xl shadow-[0_14px_30px_rgba(15,23,42,0.08)] border border-slate-200 p-6 md:p-7 space-y-5">
              {/* TITLE + STATUS */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-[26px] font-semibold text-slate-900 leading-snug">
                    {p.ProductName}
                  </h1>

                  <span
                    className={`px-2.5 py-1 text-[11px] rounded-full font-semibold ${
                      p.IsActive === 1
                        ? "bg-rose-50 text-rose-600 border border-rose-100"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {p.IsActive === 1 ? "Còn bán" : "Ngưng bán"}
                  </span>
                </div>

                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  {p.CategoryName}
                </p>
              </div>

              {/* PRICE BLOCK */}
              <div className="bg-rose-50/80 border border-rose-100 rounded-2xl px-5 py-4 flex items-baseline justify-between gap-3">
                <div>
                  <p className="text-[12px] tracking-[0.18em] uppercase text-rose-400 mb-1">
                    Giá hiện tại
                  </p>
                  <p className="text-[30px] md:text-[32px] font-extrabold text-rose-500 leading-none">
                    {finalPrice.toLocaleString()}₫
                  </p>
                </div>

                {p.minPrice !== p.maxPrice && (
                  <div className="text-right text-xs text-slate-500">
                    <p>Khoảng giá:</p>
                    <p className="font-semibold text-slate-700 mt-1">
                      {Number(p.minPrice).toLocaleString()}₫ -{" "}
                      {Number(p.maxPrice).toLocaleString()}₫
                    </p>
                  </div>
                )}
              </div>

              {/* VARIANTS */}
              {p.variants.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-900">
                    Chọn biến thể
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {p.variants.map((v) => {
                      const active =
                        selectedVariant?.VariantID === v.VariantID;
                      return (
                        <button
                          key={v.VariantID}
                          onClick={() => {
                            setSelectedVariant(v);
                            if (v.images?.length > 0) {
                              setMainImage(v.images[0].ImageURL);
                            }
                          }}
                          className={`px-4 py-2 text-xs md:text-sm rounded-full border transition-all
                            ${
                              active
                                ? "bg-rose-500 text-white border-rose-500 shadow-md scale-[1.02]"
                                : "bg-white text-slate-800 border-slate-300 hover:border-rose-400 hover:text-rose-500"
                            }`}
                        >
                          {v.attributes.map((a) => a.Value).join(" - ")}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* QUANTITY */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-900">
                  Số lượng
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.max(1, q - 1))
                    }
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200"
                  >
                    -
                  </button>

                  <span className="px-4 text-lg font-semibold text-slate-900">
                    {quantity}
                  </span>

                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* ADD TO CART */}
              <button
                disabled={p.IsActive === 0}
                onClick={addToCart}
                className={`w-full mt-3 py-3.5 rounded-full font-semibold text-sm md:text-base transition-all
                  ${
                    p.IsActive === 1
                      ? "bg-rose-500 text-white shadow-md hover:bg-rose-600 hover:shadow-lg hover:translate-y-[1px]"
                      : "bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300"
                  }`}
              >
                {p.IsActive === 1 ? "Thêm vào giỏ hàng" : "Hết hàng"}
              </button>

              {/* SHORT INFO */}
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                <p>
                  Sản phẩm:{" "}
                  <span className="font-medium text-slate-800">
                    {p.ProductName}
                  </span>
                </p>
                <p>
                  Chất liệu:{" "}
                  <span className="font-medium text-slate-800">
                    {p.Material}
                  </span>
                </p>
                <p>
                  ProductsCode:{" "}
                  <span className="font-medium text-slate-800">{p.ProductCode}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* DESCRIPTION + RELATED */}
        <div className="mt-14 grid md:grid-cols-[1.15fr,0.95fr] gap-10">
          {/* DESCRIPTION */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              Mô tả sản phẩm
            </h2>
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm leading-7 text-sm text-slate-800 whitespace-pre-line">
              {p.Description}
            </div>
          </div>

          {/* RELATED PRODUCTS */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                Sản phẩm cùng loại
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {relatedProducts.slice(0, 4).map((rp) => (
                  <Link
                    key={rp.ProductID}
                    to={`/chi-tiet/${rp.CategorySlug}/${rp.ProductCode}`}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-[2px] p-3"
                  >
                    <img
                      src={rp.ImageURL}
                      alt={rp.ProductName}
                      className="w-full h-32 object-cover rounded-xl mb-2"
                    />
                    <p className="text-xs font-medium text-slate-900 line-clamp-2">
                      {rp.ProductName}
                    </p>
                    <p className="text-rose-500 font-bold text-sm mt-1">
                      {Number(rp.minPrice).toLocaleString()}₫
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
