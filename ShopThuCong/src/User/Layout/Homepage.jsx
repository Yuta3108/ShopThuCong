import React, { useState } from "react";
import { Link } from "react-router-dom";
import Banner from "./banner";
const categories = [
  { name: "Dụng Cụ Đan Móc", link: "/san-pham/dung-cu-dan-moc", image: "https://picsum.photos/200/200?10" },
  { name: "Phụ Kiện Túi Xách", link: "/san-pham/phu-kien-tui-xach", image: "https://picsum.photos/200/200?13" },
  { name: "Phụ Liệu Trang Trí", link: "/san-pham/phu-lieu-trang-tri", image: "https://picsum.photos/200/200?14" },
  { name: "Thú Bông", link: "/san-pham/phu-lieu-thu-bong", image: "https://picsum.photos/200/200?15" },
  { name: "Combo Quà Tặng", link: "/san-pham/combo", image: "https://picsum.photos/200/200?30" },
  { name: "Sản Phẩm Tiết Kiệm", link: "/san-pham/TietKiem", image: "https://picsum.photos/200/200?18" },
];

const products = [
  { id: 1, name: "Giỏ hoa len thủ công", price: "250.000đ", image: "https://picsum.photos/400/400?1", category: "Dụng Cụ Đan Móc" },
  { id: 2, name: "Vòng tay gỗ handmade", price: "120.000đ", image: "https://picsum.photos/400/400?2", category: "Dụng Cụ Đan Móc" },
  { id: 3, name: "Tranh thêu nghệ thuật", price: "350.000đ", image: "https://picsum.photos/400/400?3", category: "Dụng Cụ Đan Móc" },
  { id: 4, name: "Bình gốm sứ mini", price: "180.000đ", image: "https://picsum.photos/400/400?4", category: "Phụ Kiện Làm Túi Xách" },
  { id: 5, name: "Móc khóa len nhỏ xinh", price: "90.000đ", image: "https://picsum.photos/400/400?5", category: "Phụ Liệu Trang Trí" },
  { id: 6, name: "Mắt thú nhựa an toàn", price: "50.000đ", image: "https://picsum.photos/400/400?6", category: "Phụ Liệu Làm Thú Bông" },
  { id: 7, name: "Combo dụng cụ đan túi", price: "480.000đ", image: "https://picsum.photos/400/400?7", category: "Combo Tiết Kiệm" },
];

export default function HomePage() {
  const [quantities, setQuantities] = useState({});

  const handleQuantityChange = (id, delta) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta),
    }));
  };

  const renderProductCard = (p) => (
    <div
      key={p.id}
      className="group bg-white text-gray-900 rounded-md overflow-hidden border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.03]"
    >
      <div className="overflow-hidden">
        <img
          src={p.image}
          alt={p.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4 flex flex-col justify-between">
        <h4 className="text-base font-medium uppercase text-gray-800 line-clamp-2">
          {p.name}
        </h4>
        <p className="text-[#d81b60] font-semibold mt-1">{p.price}</p>

        {/* Bộ chỉnh số lượng */}
        <div className="flex items-center justify-center mt-3 gap-3">
          <button
            onClick={() => handleQuantityChange(p.id, -1)}
            className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-400 hover:bg-gray-100"
          >
            −
          </button>
          <span className="w-8 text-center font-medium">{quantities[p.id] || 1}</span>
          <button
            onClick={() => handleQuantityChange(p.id, 1)}
            className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-400 hover:bg-gray-100"
          >
            +
          </button>
        </div>

        <button className="mt-3 bg-[#d81b60] hover:bg-[#ff3366] text-white py-2 rounded-full transition active:scale-95">
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#EDEDED] text-gray-900">
      {/* BANNER */}
      <Banner />

      <main className="flex-grow container mx-auto px-6 py-12">
        {/* DANH MỤC NGẮN */}
        <section className="mb-16">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
            {categories.map((cat) => (
              <Link
                to={cat.link}
                key={cat.name}
                className="flex flex-col items-center text-center transition-transform duration-300 hover:scale-105"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 mb-2">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-full border border-gray-300 shadow-sm"
                  />
                </div>
                <span className="text-sm md:text-base text-gray-700">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* SẢN PHẨM NỔI BẬT */}
        <section className="mb-20">
          <h2 className="text-2xl md:text-3xl font-semibold text-[#d81b60] mb-8">
            Sản phẩm nổi bật
          </h2>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Cột banner trái */}
            <div className="md:w-1/4 relative overflow-hidden rounded-md transform transition-transform duration-500 hover:scale-[1.05]">
              <img
                src="https://picsum.photos/400/600?grayscale"
                alt="New Arrivals"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-center items-center text-center">
                <Link
                  to="/sanpham"
                  className="bg-[#d81b60] hover:bg-[#ff3366] px-5 py-2 rounded-full text-white font-medium transition"
                >
                  SHOP NOW
                </Link>
              </div>
            </div>

            {/* Grid sản phẩm */}
            <div className="md:w-3/4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map(renderProductCard)}
            </div>
          </div>

          <div className="flex justify-center mt-10">
            <button className="px-6 py-2 border border-[#d81b60] text-[#d81b60] rounded-full hover:bg-[#d81b60] hover:text-white transition">
              Xem tất cả Sản phẩm mới
            </button>
          </div>
        </section>

        {/* DANH MỤC KHÁC */}
        {categories.map((cat) => {
          const filtered = products.filter((p) => p.category === cat.name);
          if (filtered.length === 0) return null;
          return (
            <section key={cat.name} className="mb-16">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl md:text-2xl font-medium text-gray-800">{cat.name}</h3>
                <Link to={cat.link} className="text-[#d81b60] hover:text-[#ff3366]">
                  Xem tất cả →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {filtered.map(renderProductCard)}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
