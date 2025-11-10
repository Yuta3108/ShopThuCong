"use client";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Banner from "./banner";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [productsByCat, setProductsByCat] = useState({});
  const [loading, setLoading] = useState(true);

  //  Lấy danh mục và sản phẩm nổi bật
  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          axios.get(`${API}/categories`),
          axios.get(`${API}/products`),
        ]);

        const cats = catRes.data;
        setCategories(cats);

        // 🔥 Lấy 8 sản phẩm đầu tiên làm "sản phẩm nổi bật"
        const featuredList = prodRes.data.slice(0, 8);
        setFeatured(featuredList);

        // Lấy sản phẩm theo từng danh mục (chỉ 8 sản phẩm / danh mục)
        const productMap = {};
        for (const cat of cats) {
          const res = await axios.get(`${API}/products?categoryId=${cat.CategoryID}`);
          productMap[cat.CategoryID] = res.data.slice(0, 8);
        }
        setProductsByCat(productMap);
      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInit();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 animate-pulse">Đang tải dữ liệu...</p>
      </div>
    );

  const renderProductCard = (p) => (
    <div
      key={p.ProductID}
      className="group bg-white text-gray-900 rounded-md overflow-hidden border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
    >
      <Link to={`/chitiet/${p.ProductID}`}>
        <div className="overflow-hidden">
          <img
            src={p.ImageURL || "https://placehold.co/400x400?text=No+Image"}
            alt={p.ProductName}
            className="w-full h-52 sm:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      <div className="p-3 sm:p-4 flex flex-col justify-between">
        <h4 className="text-sm sm:text-base font-medium uppercase text-gray-800 line-clamp-2">
          {p.ProductName}
        </h4>
        <p className="text-[#d81b60] font-semibold mt-1">
          {p.minPrice === p.maxPrice
            ? `${p.minPrice?.toLocaleString()}₫`
            : `${p.minPrice?.toLocaleString()} - ${p.maxPrice?.toLocaleString()}₫`}
        </p>

        <Link
          to={`/chitiet/${p.ProductID}`}
          className="mt-3 bg-[#d81b60] hover:bg-[#ff3366] text-white py-2 rounded-full transition active:scale-95 text-sm sm:text-base text-center"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#EDEDED] text-gray-900">
      {/* 🔹 Banner */}
      <Banner />

      <main className="flex-grow container mx-auto px-3 sm:px-6 py-8 sm:py-12">
        {/* 🔹 DANH MỤC */}
        <section className="mb-10 sm:mb-16">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <Link
                to={`/san-pham/${cat.CategoryID}`}
                key={cat.CategoryID}
                className="flex flex-col items-center text-center transition-transform duration-300 hover:scale-105"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-2">
                  <img
                    src={`/category/${cat.CategoryID}.jpg`} // 📸 M đặt trong /public/category/
                    alt={cat.CategoryName}
                    className="w-full h-full object-cover rounded-full border border-gray-300 shadow-sm"
                    onError={(e) =>
                      (e.target.src = "https://placehold.co/200x200?text=Category")
                    }
                  />
                </div>
                <span className="text-xs sm:text-sm md:text-base text-gray-700 line-clamp-2">
                  {cat.CategoryName}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 🔥 SẢN PHẨM NỔI BẬT */}
        <section className="mb-16 sm:mb-20">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#d81b60] mb-6 sm:mb-8">
            Sản phẩm nổi bật
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.map(renderProductCard)}
          </div>

          <div className="flex justify-center mt-8 sm:mt-10">
            <Link
              to="/sanpham"
              className="px-4 sm:px-6 py-2 border border-[#d81b60] text-[#d81b60] rounded-full hover:bg-[#d81b60] hover:text-white transition text-sm sm:text-base"
            >
              Xem tất cả sản phẩm
            </Link>
          </div>
        </section>

        {/* 🔹 SẢN PHẨM THEO DANH MỤC */}
        {categories.map((cat) => {
          const prods = productsByCat[cat.CategoryID] || [];
          if (!prods.length) return null;
          return (
            <section key={cat.CategoryID} className="mb-14 sm:mb-20">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl md:text-2xl font-medium text-gray-800">
                  {cat.CategoryName}
                </h3>
                <Link
                  to={`/san-pham/${cat.CategoryID}`}
                  className="text-[#d81b60] hover:text-[#ff3366] text-sm sm:text-base"
                >
                  Xem tất cả →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                {prods.map(renderProductCard)}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
