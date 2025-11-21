import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../../Layout/Header";
import Footer from "../../Layout/Footer";
import axios from "axios";

const API = "https://backend-eta-ivory-29.vercel.app/api";

export default function ProductDetailPage() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [categorySlug, setCategorySlug] = useState("");
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Lấy slug category
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const { data } = await axios.get(`${API}/products/${id}`);
        setProduct(data);

        // Ảnh chính
        const firstVariant = data?.variants?.[0];
        const firstImage = firstVariant?.images?.[0]?.ImageURL;
        setMainImage(firstImage || data.ImageURL);

        setSelectedVariant(firstVariant || null);
        setLoading(false);

        // Lấy slug danh mục
        const catRes = await axios.get(`${API}/categories`);
        const cat = catRes.data.find(c => c.CategoryID === data.CategoryID);
        setCategorySlug(cat?.Slug || "");

        // Lấy SP liên quan
        const relatedRes = await axios.get(
          `${API}/products?categoryId=${data.CategoryID}`
        );
        const filtered = relatedRes.data.filter(
          (item) => item.ProductID !== data.ProductID
        );
        setRelatedProducts(filtered.slice(0, 10));

      } catch (err) {
        console.log(err);
      }
    };

    loadProduct();
  }, [id]);
  if (loading) return <p className="text-center py-10">Đang tải…</p>;
  if (!product) return <p>Không tìm thấy sản phẩm.</p>;

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
    // LOCAL
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
        ImageURL: mainImage,
        quantity,
        price: finalPrice,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Đã thêm vào giỏ hàng!");
    return;
  }

  // DB MODE
  await fetch("https://backend-eta-ivory-29.vercel.app/api/cart/add", {
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

  alert("Đã thêm vào giỏ hàng!");
};



  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      <Header />

      {/* ================= BREADCRUMB ================= */}
      <div className="container mx-auto px-4 py-4 text-sm text-gray-600 flex items-center gap-2">
        <Link to="/" className="hover:text-pink-600">Trang chủ</Link>
        <span className="text-gray-400">›</span>

        <Link to="/san-pham" className="hover:text-pink-600">
          Tất cả sản phẩm
        </Link>
        <span className="text-gray-400">›</span>

        <Link
          to={`/san-pham/${categorySlug}`}
          className="hover:text-pink-600"
        >
          {p.CategoryName}
        </Link>
        <span className="text-pink-600">›</span>

        <span className="text-pink-600 ml-1 font-semibold">{p.ProductName}</span>
      </div>

      {/* ================= MAIN ================= */}
      <div className="container mx-auto px-4 pb-16 grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* LEFT – IMAGES */}
        <div>
          {/* MAIN IMAGE */}
          <div className="w-full mb-4">
            <img
              src={mainImage}
              className="w-full h-[450px] object-cover rounded-xl shadow-lg"
            />
          </div>

          {/* THUMBNAILS UNDER MAIN IMAGE */}
          <div className="flex gap-3 overflow-x-auto py-2 justify-center">
            {thumbnails.map((img, i) => (
              <img
                key={i}
                src={img.ImageURL}
                onClick={() => setMainImage(img.ImageURL)}
                className={`w-20 h-20 object-cover rounded-lg cursor-pointer border transition-all 
          ${mainImage === img.ImageURL
                    ? "border-[#C2185B] scale-105 shadow-md"
                    : "border-gray-300 hover:border-[#C2185B]"
                  }
        `}
              />
            ))}
          </div>
        </div>

        {/* RIGHT – DETAILS */}
        <div>

          {/* NAME */}
          <h1 className="text-3xl font-bold text-gray-900 leading-snug">
            {p.ProductName}
          </h1>

          {/* STATUS */}
          <p className="mt-2 text-gray-700 text-sm">
            Tình trạng:{" "}
            {p.IsActive === 1 ? (
              <span className="text-green-600 font-semibold">Còn bán</span>
            ) : (
              <span className="text-red-500 font-semibold">Ngừng bán</span>
            )}
          </p>

          {/* PRICE */}
          <div className="bg-white border rounded-xl p-5 mt-5 shadow-sm">
            <p className="text-4xl font-extrabold text-red-500 drop-shadow-sm">
              {finalPrice.toLocaleString()}₫
            </p>
          </div>

          {/* VARIANTS */}
          {p.variants.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2 text-gray-800 text-sm">
                Chọn biến thể
              </h3>

              <div className="flex flex-wrap gap-3">
                {p.variants.map((v) => (
                  <button
                    key={v.VariantID}
                    onClick={() => {
                      setSelectedVariant(v);
                      if (v.images?.length > 0) {
                        setMainImage(v.images[0].ImageURL);
                      }
                    }}
                    className={`
                      px-5 py-2 text-sm rounded-full border transition-all
                      ${selectedVariant?.VariantID === v.VariantID
                        ? "bg-[#d12d6f] text-white border-[#C2185B] shadow-md scale-[1.03]"
                        : "bg-white text-gray-700 border-gray-300 hover:border-[#cc1d63] hover:text-[#C2185B]"
                      }
                    `}
                  >
                    {v.attributes.map((a) => a.Value).join(" - ")}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QUANTITY */}
          <div className="mt-6">
            <p className="font-semibold mb-2 text-gray-800">Số lượng</p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-1 bg-gray-200 rounded-full hover:bg-gray-300"
              >
                -
              </button>

              <span className="px-4">{quantity}</span>

              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-1 bg-gray-200 rounded-full hover:bg-gray-300"
              >
                +
              </button>
            </div>
          </div>

          {/* ADD TO CART */}
          <button
            disabled={p.IsActive === 0}
            onClick={addToCart}
            className={`
    w-full mt-8 py-3 rounded-xl font-semibold text-lg transition-all
    ${p.IsActive === 1
                ? "bg-white text-gray-800 border border-gray-300 shadow-sm hover:bg-gray-50 hover:shadow-md hover:scale-[1.02]"
                : "bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-300"
              }
  `}
          >
            {p.IsActive === 1 ? "Thêm vào giỏ hàng" : "Hết hàng"}
          </button>

          {/* DESCRIPTION MOVED UP HERE */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-800 mb-3">
              MÔ TẢ SẢN PHẨM
            </h2>

            <div className="bg-white p-6 rounded-xl border leading-7 shadow-sm">
              <p className="text-gray-700 whitespace-pre-line">
                {p.Description}
              </p>

              <hr className="my-6" />

              <div className="grid grid-cols-2 gap-y-3 text-gray-700 text-sm">
                <span className="font-semibold">Sản phẩm:</span>
                <span>{p.ProductName}</span>

                <span className="font-semibold">Danh mục:</span>
                <span>{p.CategoryName}</span>

                <span className="font-semibold">Chất liệu:</span>
                <span>{p.Material}</span>

                <span className="font-semibold">SKU:</span>
                <span>{p.SKU}</span>
              </div>
            </div>
          </div>
        </div>
        {relatedProducts.length > 0 && (
          <div className="container mx-auto px-4 mt-16 pb-20">
            <h2 className="text-xl font-bold text-gray-800 mb-5">
              Sản phẩm cùng loại
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rp) => (
                <Link
                  key={rp.ProductID}
                  to={`/chi-tiet/${rp.ProductID}`}
                  className="bg-white rounded-2xl border shadow-md hover:shadow-xl transition-all p-4 hover:-translate-y-1"
                >
                  <img
                    src={rp.ImageURL}
                    className="w-full h-52 object-cover rounded-xl"
                  />

                  <p className="mt-4 text-gray-900 font-semibold text-base line-clamp-2">
                    {rp.ProductName}
                  </p>

                  <p className="text-red-500 font-bold mt-2 text-lg">
                    {Number(rp.minPrice).toLocaleString()}₫
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
}
