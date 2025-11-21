"use client";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Banner from "./banner";
import axios from "axios";
import ProductCard from "../ChucNang/Products/ProductCard";

const API = "https://backend-eta-ivory-29.vercel.app/api";

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [productsByCat, setProductsByCat] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          axios.get(`${API}/categories`),
          axios.get(`${API}/products`),
        ]);

        const cats = catRes.data;
        setCategories(cats);

        setFeatured(prodRes.data.slice(0, 20));

        const productMap = {};
        for (const cat of cats) {
          const res = await axios.get(`${API}/products?categoryId=${cat.CategoryID}`);
          productMap[cat.CategoryID] = res.data.slice(0, 10);
        }
        setProductsByCat(productMap);
      } catch (err) {
        console.log("❌ Lỗi khi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInit();
  }, []);

  const addToCart = (product) => {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const key = product.ProductID;

  const existing = cart.find((item) => item.key === key);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      key,                     
      ProductID: product.ProductID,
      VariantID: null,         
      ProductName: product.ProductName,
      ImageURL: product.ImageURL,
      price: Number(product.minPrice),
      quantity: 1,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Đã thêm vào giỏ hàng!");
};
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 animate-pulse">Đang tải dữ liệu...</p>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5] text-gray-900">

      {/* Banner đầu trang */}
      <Banner />

      <main className="flex-grow container mx-auto px-4 sm:px-6 py-10">

        {/* ===================== DANH MỤC ===================== */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold mb-5 text-gray-800">
            Danh mục sản phẩm
          </h2>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-5">
            {categories.map((cat) => (
              <Link
                key={cat.CategoryID}
                to={`/san-pham/${cat.Slug}`}
                className="flex flex-col items-center text-center hover:scale-105 transition"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-2">
                  <img
                    src={`/category/${cat.CategoryID}.jpg`}
                    onError={(e) => (e.target.src = "https://placehold.co/200")}
                    alt={cat.CategoryName}
                    className="w-full h-full object-cover rounded-full shadow-md border"
                  />
                </div>
                <span className="text-sm text-gray-700 line-clamp-2">
                  {cat.CategoryName}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ===================== SẢN PHẨM NỔI BẬT ===================== */}
        <section className="mb-20">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#d81b60] mb-6">
            Sản phẩm nổi bật
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Banner trái */}
            <div className="md:col-span-1">
              <img
                src="/category/banner-new.jpg"
                className="rounded-xl shadow-md w-full h-full object-cover"
              />
            </div>

            {/* Grid sản phẩm 5 cột */}
            <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
              {featured.slice(0, 10).map((p) => (
                <ProductCard key={p.ProductID} p={p} addToCart={addToCart} />
              ))}
            </div>
          </div>
        </section>

        {/* ===================== SẢN PHẨM THEO DANH MỤC ===================== */}
        {categories.map((cat) => {
          const prods = productsByCat[cat.CategoryID] || [];
          if (!prods.length) return null;

          return (
            <section key={cat.CategoryID} className="mb-20">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-semibold text-gray-800">
                  {cat.CategoryName}
                </h3>
                <Link
                  to={`/san-pham/${cat.Slug}`}
                  className="text-[#d81b60] hover:text-[#ff2f6d] font-medium"
                >
                  Xem tất cả →
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
                {prods.map((p) => (
                  <ProductCard key={p.ProductID} p={p} addToCart={addToCart} />
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
