import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import Header from "../../Layout/Header";
import Footer from "../../Layout/Footer";
import ProductCard from "./ProductCard";
import ProductFilterSidebar from "./ProductFilterSidebar";
import QuickViewModal from "../../Layout/QuickViewModal";

const API = "http://localhost:5000/api";

export default function ProductAllPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // FILTER STATES
  const [filterSort, setFilterSort] = useState("newest");
  const [filterType, setFilterType] = useState(null);
  const [filterPrice, setFilterPrice] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const [openCatBox, setOpenCatBox] = useState(true);
  const [openPriceBox, setOpenPriceBox] = useState(true);

  const [searchParams] = useSearchParams();
  const searchKeyword = searchParams.get("search") || "";

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/products`),
      axios.get(`${API}/categories`),
    ]).then(([prodRes, catRes]) => {
      setProducts(prodRes.data);
      setCategories(catRes.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    filterSort,
    filterType,
    filterPrice,
    priceRange,
    searchKeyword,
    selectedCategoryId,
  ]);

  const filteredProducts = products
    .filter((p) =>
      searchKeyword
        ? p.ProductName?.toLowerCase().includes(searchKeyword.toLowerCase())
        : true
    )
    .filter((p) =>
      selectedCategoryId ? p.CategoryID === selectedCategoryId : true
    )
    .filter((p) => {
      if (!filterType) return true;
      if (filterType === "new") 
        return Date.now() - new Date(p.CreatedAt).getTime() < 30 * 24 * 60 * 60 * 1000;
      if (filterType === "hot") return p.IsActive === 1;
      return true;
    })
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
    .filter((p) => {
      const min = Number(p.minPrice);
      return min >= priceRange[0] && min <= priceRange[1];
    })
    .sort((a, b) => {
      if (filterSort === "newest") return b.ProductID - a.ProductID;
      if (filterSort === "price_asc") return a.minPrice - b.minPrice;
      if (filterSort === "price_desc") return b.minPrice - a.minPrice;
      return 0;
    });

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearAllFilter = () => {
    setFilterType(null);
    setFilterPrice(null);
    setPriceRange([0, 500000]);
    setSelectedCategoryId(null);
  };

  if (loading)
    return (
      <div className="bg-[#F5F5F5] min-h-screen">
        <Header />
        <p className="text-center py-10">Đang tải...</p>
      </div>
    );

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-4 text-sm">
        <Link to="/">Trang chủ</Link> /{" "}
        <span className="text-rose-500">Tất cả sản phẩm</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16 lg:grid lg:grid-cols-12 gap-6">
        <ProductFilterSidebar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          setSelectedCategoryId={setSelectedCategoryId}
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

        <div className="lg:col-span-9">
          <div className="flex justify-between mb-6">
            <h2 className="font-semibold text-rose-500">
              Tất cả sản phẩm ({filteredProducts.length})
            </h2>

            <select
              value={filterSort}
              onChange={(e) => setFilterSort(e.target.value)}
              className="border px-3 py-2 rounded"
            >
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá thấp → cao</option>
              <option value="price_desc">Giá cao → thấp</option>
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {paginatedProducts.map((p) => (
              <ProductCard
                key={p.ProductID}
                p={p}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
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
