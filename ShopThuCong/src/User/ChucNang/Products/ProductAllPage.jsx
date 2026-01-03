import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../Layout/Header";
import Footer from "../../Layout/Footer";
import axios from "axios";
import ProductCard from "./ProductCard";
import ProductFilterSidebar from "./ProductFilterSidebar";
import QuickViewModal from "../../Layout/QuickViewModal";
import { useSearchParams } from "react-router-dom";
const API = "https://backend-eta-ivory-29.vercel.app/api";

export default function ProductAllPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // FILTER
  const [filterSort, setFilterSort] = useState("newest");
  const [filterPrice, setFilterPrice] = useState(null);
  const [openPriceBox, setOpenPriceBox] = useState(true);
  const [searchParams] = useSearchParams();
  const searchKeyword = searchParams.get("search") || "";

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const prodRes = await axios.get(`${API}/products`);
        setProducts(prodRes.data);
      } catch {
        console.error("Lỗi");
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterPrice, filterSort]);

  const filteredProducts = products
  // SEARCH
  .filter((p) => {
    if (!searchKeyword) return true;
    return p.ProductName
      ?.toLowerCase()
      .includes(searchKeyword.toLowerCase());
  })

  //  PRICE FILTER
  .filter((p) => {
    if (!filterPrice) return true;
    const min = Number(p.minPrice);
    if (filterPrice === "under100") return min < 100000;
    if (filterPrice === "100-200") return min >= 100000 && min <= 200000;
    if (filterPrice === "200-500") return min >= 200000 && min <= 500000;
    if (filterPrice === "above500") return min > 500000;
    return true;
  })

  // ↕ SORT
  .sort((a, b) => {
    if (filterSort === "newest") return b.ProductID - a.ProductID;
    if (filterSort === "price_asc") return a.minPrice - b.minPrice;
    if (filterSort === "price_desc") return b.minPrice - a.minPrice;
    return 0;
  });
  useEffect(() => {
  setCurrentPage(1);
  }, [searchKeyword]);
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

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

      {/* BREADCRUMB */}
      <div className="max-w-7xl mx-auto px-4 py-4 text-sm text-slate-600">
        <Link to="/" className="hover:text-rose-500">
          Trang chủ
        </Link>{" "}
        /{" "}
        <span className="text-rose-500 font-medium">Tất cả sản phẩm</span>
      </div>

      {/* MAIN */}
      <div className="max-w-7xl mx-auto px-4 pb-16 lg:grid lg:grid-cols-12 lg:gap-6 gap-4">
        {/* SIDEBAR */}
        <ProductFilterSidebar
          openPriceBox={openPriceBox}
          setOpenPriceBox={setOpenPriceBox}
          filterPrice={filterPrice}
          setFilterPrice={setFilterPrice}
        />

        {/* CONTENT */}
        <div className="lg:col-span-9 mt-6 lg:mt-0">
          {/* HEADER + SORT */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-rose-500">
              Tất cả sản phẩm
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
            {paginatedProducts.map((p) => (
              <ProductCard key={p.ProductID} p={p} onQuickView={setQuickViewProduct} />
            ))}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={safePage === 1}
                className={`px-3 py-1.5 text-sm rounded-md border ${
                  safePage === 1
                    ? "text-slate-400 border-slate-200 cursor-not-allowed"
                    : "text-slate-700 border-slate-300 bg-white hover:bg-slate-50"
                }`}
              >
                Trước
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
              ))}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={safePage === totalPages}
                className={`px-3 py-1.5 text-sm rounded-md border ${
                  safePage === totalPages
                    ? "text-slate-400 border-slate-200 cursor-not-allowed"
                    : "text-slate-700 border-slate-300 bg-white hover:bg-slate-50"
                }`}
              >
                Sau
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* POPUP */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}
