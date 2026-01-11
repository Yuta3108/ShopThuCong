import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Banner from "./banner";
import axios from "axios";
import ProductCard from "../ChucNang/Products/ProductCard";
import QuickViewModal from "./QuickViewModal";

const API = "http://localhost:5000/api";

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [productsByCat, setProductsByCat] = useState({});
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          axios.get(`${API}/categories`),
          axios.get(`${API}/products`),
        ]);

        const cats = catRes.data;
        setCategories(cats);

        // Lấy 20 sp đầu làm nổi bật
        setFeatured(prodRes.data.slice(0, 20));

        // Lấy sp theo từng danh mục
        const productMap = {};
        for (const cat of cats) {
          const res = await axios.get(
            `${API}/products?categoryId=${cat.CategoryID}`
          );
          productMap[cat.CategoryID] = res.data.slice(0, 10);
        }
        setProductsByCat(productMap);
      } catch (err) {
        console.log("Lỗi khi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInit();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <p className="text-slate-500 animate-pulse text-sm tracking-[0.25em] uppercase">
          Đang tải dữ liệu...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5] text-slate-900">
      {/* BANNER TRÊN CÙNG */}
      <Banner />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          {/*  DANH MỤC  */}
          <section className="mb-14 md:mb-20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-rose-400/80">
                  Danh mục
                </p>
                <h2 className="text-xl md:text-2xl font-semibold text-slate-900">
                  Danh mục sản phẩm
                </h2>
              </div>
              <span className="hidden md:inline-block text-[11px] text-slate-500 uppercase tracking-[0.22em]">
                Lựa chọn cho mọi phong cách
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 md:gap-6">
              {categories.map((cat) => (
                <Link
                  key={cat.CategoryID}
                  to={`/san-pham/${cat.Slug}`}
                  className="group flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-2 rounded-2xl overflow-hidden relative shadow-md bg-white border border-slate-200">
                    <img
                        src={cat.ImageURL || "https://placehold.co/260x260"}
                        alt={cat.CategoryName}
                        className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-300"
                      />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-xs sm:text-sm text-slate-800 line-clamp-2 group-hover:text-rose-500 transition-colors">
                    {cat.CategoryName}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/*  SẢN PHẨM NỔI BẬT  */}
          <section className="mb-16 md:mb-20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-rose-400/80">
                  Gợi ý cho bạn
                </p>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-rose-500">
                  Sản phẩm nổi bật
                </h2>
              </div>
              <Link
                to="/san-pham"
                className="hidden md:inline-flex items-center text-[13px] text-rose-500 hover:text-rose-600 transition-colors"
              >
                Xem tất cả sản phẩm →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Banner trái – GIỮ NGUYÊN HÌNH NHƯ ANH */}
              <div className="md:col-span-1">
                <img
                  src="/category/banner-new.jpg"
                  className="rounded-xl shadow-md w-full h-full object-cover"
                  alt="Banner nổi bật"
                />
              </div>

              {/* Grid sản phẩm */}
              <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-4">
                {featured.slice(0, 8).map((p) => (
                  <ProductCard
                    key={p.ProductID}
                    p={p}
                    onQuickView={setQuickViewProduct}
                  />
                ))}
              </div>
            </div>
          </section>

          {/*  SẢN PHẨM THEO DANH MỤC  */}
          {categories.map((cat) => {
            const prods = productsByCat[cat.CategoryID] || [];
            if (!prods.length) return null;

            return (
              <section key={cat.CategoryID} className="mb-16 md:mb-20">
                <div className="flex justify-between items-baseline mb-5">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
                      Danh mục
                    </p>
                    <h3 className="text-xl font-semibold text-slate-900">
                      {cat.CategoryName}
                    </h3>
                  </div>
                  <Link
                    to={`/san-pham/${cat.Slug}`}
                    className="text-sm text-rose-500 hover:text-rose-600 font-medium"
                  >
                    Xem tất cả →
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
                  {prods.map((p) => (
                    <ProductCard
                      key={p.ProductID}
                      p={p}
                      onQuickView={setQuickViewProduct}
                    />
                  ))}
                </div>
              </section>
            );
          })}

          {/*  POPUP QUICK VIEW  */}
          {quickViewProduct && (
            <QuickViewModal
              product={quickViewProduct}
              onClose={() => setQuickViewProduct(null)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
