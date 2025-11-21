import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../Layout/Header";
import Footer from "../../Layout/Footer";
import axios from "axios";
import ProductCard from "./ProductCard";
import ProductFilterSidebar from "./ProductFilterSidebar";

const API = "https://backend-eta-ivory-29.vercel.app/api";

export default function ProductAllPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // FILTER
    const [filterSort, setFilterSort] = useState("newest");
    const [filterPrice, setFilterPrice] = useState(null);

    const [openPriceBox, setOpenPriceBox] = useState(true);

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

    // khi filter/sort đổi thì quay lại trang 1
    useEffect(() => {
        setCurrentPage(1);
    }, [filterPrice, filterSort]);

    // FILTER + SORT
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
        .sort((a, b) => {
            if (filterSort === "newest") return b.ProductID - a.ProductID;
            if (filterSort === "price_asc") return a.minPrice - b.minPrice;
            if (filterSort === "price_desc") return b.minPrice - a.minPrice;
            return 0;
        });

    // TÍNH PAGINATION
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

    // ADD CART
    const addToCart = (product) => {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        // Nếu SP có biến thể thì dùng VariantID, không thì dùng ProductID
        const key = product.VariantID ?? product.ProductID;

        const existing = cart.find((item) => item.key === key);

        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({
                key,
                ProductID: product.ProductID,
                VariantID: product.VariantID ?? null,
                ProductName: product.ProductName,
                ImageURL: product.ImageURL,
                price: Number(product.minPrice ?? product.Price ?? product.price),
                quantity: 1,
            });
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        alert("Đã thêm vào giỏ hàng!");
    };

    if (loading)
        return <p className="text-center py-10 text-gray-600">Đang tải...</p>;

    return (
        <div className="bg-[#F5F5F5] min-h-screen">
            <Header />

            <div className="container mx-auto px-4 py-4 text-sm text-gray-600">
                <Link to="/">Trang chủ</Link> /
                <span className="text-pink-600 ml-1">Tất cả sản phẩm</span>
            </div>

            {/* MAIN LAYOUT: mobile = stack, desktop = 2 cột (sidebar + content) */}
            <div className="container mx-auto px-4 pb-16 lg:grid lg:grid-cols-12 lg:gap-6 gap-4">

                {/* SIDEBAR (trên mobile nằm trên, desktop chiếm 3/12) */}
                <ProductFilterSidebar
                    openPriceBox={openPriceBox}
                    setOpenPriceBox={setOpenPriceBox}
                    filterPrice={filterPrice}
                    setFilterPrice={setFilterPrice}
                />

                {/* RIGHT CONTENT */}
                <div className="lg:col-span-9 mt-6 lg:mt-0">
                    {/* TITLE + SORT responsive */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-pink-600">
                            Tất cả sản phẩm
                            <span className="text-gray-500 ml-2">
                                ({filteredProducts.length} sản phẩm)
                            </span>
                        </h2>

                        <select
                            value={filterSort}
                            onChange={(e) => setFilterSort(e.target.value)}
                            className="border px-3 py-2 rounded-md shadow-sm text-sm w-full sm:w-auto"
                        >
                            <option value="newest">Mới nhất</option>
                            <option value="price_asc">Giá thấp → cao</option>
                            <option value="price_desc">Giá cao → thấp</option>
                        </select>
                    </div>

                    {/* GRID — RESPONSIVE: 2 cột mobile, tới 6 cột desktop */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                        {paginatedProducts.map((p) => (
                            <ProductCard key={p.ProductID} p={p} addToCart={addToCart} />
                        ))}
                    </div>

                    {/* PAGINATION */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={safePage === 1}
                                className={`px-3 py-1.5 text-sm rounded-md border ${safePage === 1
                                    ? "text-gray-400 border-gray-200 cursor-not-allowed"
                                    : "text-gray-700 border-gray-300 hover:bg-gray-100"
                                    }`}
                            >
                                Trước
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                (page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 rounded-md text-sm flex items-center justify-center border ${page === safePage
                                            ? "bg-pink-600 text-white border-pink-600"
                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
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
                                className={`px-3 py-1.5 text-sm rounded-md border ${safePage === totalPages
                                    ? "text-gray-400 border-gray-200 cursor-not-allowed"
                                    : "text-gray-700 border-gray-300 hover:bg-gray-100"
                                    }`}
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}
