import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

import Header from "../../Layout/Header";
import Footer from "../../Layout/Footer";
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

  // ===== FILTER STATES =====
  const [filterSort, setFilterSort] = useState("newest");
  const [filterType, setFilterType] = useState(null); // new | hot
  const [filterPrice, setFilterPrice] = useState(null); // radio
  const [priceRange, setPriceRange] = useState([0, 500000]); // slider

  // ===== SIDEBAR ACCORDION =====
  const [openCatBox, setOpenCatBox] = useState(true);
  const [openPriceBox, setOpenPriceBox] = useState(true);

  // ===== PAGINATION =====
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // ===== LOAD DATA =====
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

  // RESET PAGE WHEN FILTER CHANGE
  useEffect(() => {
    setCurrentPage(1);
  }, [filterPrice, filterSort, filterType, priceRange]);

  // ===== FILTER + SORT =====
  const filteredProducts = products
    // RADIO PRICE
    .filter((p) => {
      if (!filterPrice) return true;
      const min = Number(p.minPrice);
      if (filterPrice === "under100") return min < 100000;
      if (filterPrice === "100-200")
        return min >= 100000 && min <= 200000;
      if (filterPrice === "200-500")
        return min >= 200000 && min <= 500000;
      if (filterPrice === "above500") return min > 500000;
      return true;
    })
    // SLIDER PRICE
    .filter((p) => {
      const min = Number(p.minPrice);
      return min >= priceRange[0] && min <= priceRange[1];
    })
    // TYPE FILTER
    .filter((p) => {
      if (!filterType) return true;
      if (filterType === "new")
        return Date.now() - new Date(p.CreatedAt).getTime() < 30 * 24 * 60 * 60 * 1000;
      if (filterType === "hot") return p.IsActive === 1;
      return true;
    })
    // SORT
    .sort((a, b) => {
      if (filterType === "new") return b.ProductID - a.ProductID;
      if (filterType === "hot") return b.ProductID - a.ProductID;
      if (filterSort === "price_asc") return a.minPrice - b.minPrice;
      if (filterSort === "price_desc") return b.minPrice - a.minPrice;
      return b.ProductID - a.ProductID;
    });

  // ===== PAGINATION =====
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / itemsPerPage)
  );
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // ===== CLEAR FILTER =====
  const clearAllFilter = () => {
    setFilterType(null);
    setFilterPrice(null);
    setPriceRange([0, 500000]);
  };

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
        <Link to="/san-pham" className="hover:text-rose-500">
          Tất cả sản phẩm
        </Link>{" "}
        /{" "}
        <span className="text-rose-500 font-medium">
          {category?.CategoryName}
        </span>
      </div>

      {/* MAIN */}
      <div className="max-w-7xl mx-auto px-4 pb-16 lg:grid lg:grid-cols-12 lg:gap-6 gap-4">
        {/* SIDEBAR */}
        <ProductFilterSidebar
          openCatBox={openCatBox}
          setOpenCatBox={setOpenCatBox}
          openPriceBox={openPriceBox}
          setOpenPriceBox={setOpenPriceBox}
          filterType={filterType}
          setFilterType={setFilterType}
          filterPrice={filterPrice}
          setFilterPrice={setFilterPrice}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          showSliderPrice
          onClearFilter={clearAllFilter}
        />

        {/* CONTENT */}
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
              className="border border-slate-300 px-3 py-2 rounded-lg shadow-sm text-sm bg-white"
            >
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá thấp → cao</option>
              <option value="price_desc">Giá cao → thấp</option>
            </select>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                onClick={() =>
                  setCurrentPage((prev) => Math.max(1, prev - 1))
                }
                disabled={safePage === 1}
                className="px-3 py-1.5 text-sm rounded-md border bg-white disabled:text-slate-400"
              >
                Trước
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-md text-sm border ${
                      page === safePage
                        ? "bg-rose-500 text-white border-rose-500"
                        : "bg-white text-slate-700 border-slate-300"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(totalPages, prev + 1)
                  )
                }
                disabled={safePage === totalPages}
                className="px-3 py-1.5 text-sm rounded-md border bg-white disabled:text-slate-400"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}
