import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../../Layout/Header";
import Footer from "../../Layout/Footer";
import axios from "axios";

import ProductCard from "./ProductCard";
import ProductFilterSidebar from "./ProductFilterSidebar";
import QuickViewModal from "../../Layout/QuickViewModal";

const API = "https://backend-eta-ivory-29.vercel.app/api";

export default function ProductCategoryPage() {
  const { slug } = useParams();

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // FILTER STATES
  const [filterSort, setFilterSort] = useState("newest");
  const [filterType, setFilterType] = useState(null);
  const [filterPrice, setFilterPrice] = useState(null);

  // SIDEBAR ACCORDION
  const [openCatBox, setOpenCatBox] = useState(true);
  const [openPriceBox, setOpenPriceBox] = useState(true);

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const loadData = async () => {
      try {
        const catRes = await axios.get(`${API}/categories/slug/${slug}`);
        setCategory(catRes.data);

        const prodRes = await axios.get(
          `${API}/products?categoryId=${catRes.data.CategoryID}`
        );
        setProducts(prodRes.data);
      } catch (err) {
        console.error("Lỗi:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterPrice, filterSort, filterType]);

  const filteredProducts = products
    .filter((p) => {
      if (!filterPrice) return true;
      const min = Number(p.minPrice);

      if (filterPrice === "under100") return min < 100000;
      if (filterPrice === "100-200") return min >= 100000 && min <= 200000;
      if (filterPrice === "200-500") return min >= 200000 && min <= 500000;
      if (filterPrice === "above500") return min > 500000;

      return true;
    })
    .filter((p) => {
      if (!filterType) return true;
      if (filterType === "new") return p.IsActive === 1;
      if (filterType === "hot") return true; // sau này có field bán chạy thì chỉnh sau
      return true;
    })
    .sort((a, b) => {
      if (filterSort === "newest") return b.ProductID - a.ProductID;
      if (filterSort === "price_asc") return a.minPrice - b.minPrice;
      if (filterSort === "price_desc") return b.minPrice - a.minPrice;
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  if (loading)
    return (
      <div className="bg-[#F5F5F5] min-h-screen">
        <Header />
        <p className="text-center py-10 text-slate-500">Đang tải...</p>
      </div>
    );

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      <Header />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4 text-sm text-slate-600">
        <Link to="/" className="hover:text-rose-500">
          Trang chủ
        </Link>{" "}
        /{" "}
        <Link to="/san-pham" className="hover:text-rose-500">
          Tất cả sản phẩm
        </Link>{" "}
        /{" "}
        <span className="text-rose-500 font-medium">
          {category?.CategoryName || "Danh mục"}
        </span>
      </div>

      {/* MAIN */}
      <div className="max-w-7xl mx-auto px-4 pb-16 lg:grid lg:grid-cols-12 lg:gap-6 gap-4">
        {/* LEFT SIDEBAR */}
        <ProductFilterSidebar
          openCatBox={openCatBox}
          setOpenCatBox={setOpenCatBox}
          openPriceBox={openPriceBox}
          setOpenPriceBox={setOpenPriceBox}
          filterType={filterType}
          setFilterType={setFilterType}
          filterPrice={filterPrice}
          setFilterPrice={setFilterPrice}
        />

        {/* RIGHT CONTENT */}
        <div className="lg:col-span-9 mt-6 lg:mt-0">
          {/* TITLE + SORT */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-rose-500">
              {category?.CategoryName}
              <span className="text-slate-500 ml-2">
                ({filteredProducts.length} sản phẩm)
              </span>
            </h2>

            <select
              value={filterSort}
              onChange={(e) => setFilterSort(e.target.value)}
              className="border border-slate-300 px-3 py-2 rounded-lg shadow-sm text-sm w-full sm:w-auto bg-white"
            >
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá thấp → cao</option>
              <option value="price_desc">Giá cao → thấp</option>
            </select>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {paginatedProducts.map((p) => (
              <ProductCard
                key={p.ProductID}
                p={p}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={safePage === 1}
                className="px-3 py-1.5 text-sm rounded-md border text-slate-700 bg-white hover:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed"
              >
                Trước
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-md text-sm flex items-center justify-center border ${
                      page === safePage
                        ? "bg-rose-500 text-white border-rose-500"
                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={safePage === totalPages}
                className="px-3 py-1.5 text-sm rounded-md border text-slate-700 bg-white hover:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* POPUP QUICK VIEW */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}
