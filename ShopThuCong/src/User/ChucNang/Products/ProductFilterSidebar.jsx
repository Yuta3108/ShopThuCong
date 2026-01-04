import React from "react";
import { ChevronDown } from "lucide-react";

export default function ProductFilterSidebar({
  // CATEGORY FILTER
  categories = [],
  selectedCategoryId,
  setSelectedCategoryId,

  // TYPE FILTER 
  openCatBox,
  setOpenCatBox,
  filterType,
  setFilterType,

  // PRICE FILTER
  openPriceBox,
  setOpenPriceBox,
  filterPrice,
  setFilterPrice,

  // SLIDER
  priceRange,
  setPriceRange,
  showSliderPrice = false,

  // CLEAR
  onClearFilter,
}) {
  return (
    <div className="lg:col-span-3 space-y-6">

      {/* DANH MỤC SẢN PHẨM  */}
      {categories.length > 0 && (
        <div className="bg-white border rounded-2xl p-4 shadow-sm">
          <p className="font-semibold text-sm mb-3">Loại sản phẩm</p>

          <ul className="space-y-2 text-sm">
            <li
              onClick={() => setSelectedCategoryId(null)}
              className={`cursor-pointer ${
                selectedCategoryId === null
                  ? "text-rose-500 font-semibold"
                  : "text-slate-700"
              }`}
            >
              Tất cả
            </li>

            {categories.map((cat) => (
              <li
                key={cat.CategoryID}
                onClick={() => setSelectedCategoryId(cat.CategoryID)}
                className={`cursor-pointer hover:text-rose-500 ${
                  selectedCategoryId === cat.CategoryID
                    ? "text-rose-500 font-semibold"
                    : "text-slate-700"
                }`}
              >
                {cat.CategoryName}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* PHÂN LOẠI  */}
      {setFilterType && (
        <div className="bg-white border rounded-2xl p-4 shadow-sm">
          <button
            onClick={() => setOpenCatBox(!openCatBox)}
            className="w-full flex justify-between items-center font-semibold text-sm"
          >
            Phân loại
            <ChevronDown
              size={18}
              className={`${openCatBox ? "rotate-180" : ""} transition`}
            />
          </button>

          {openCatBox && (
            <ul className="mt-4 space-y-2 text-sm">
              {[
                { key: "hot", label: " Được mua nhiều" },
                { key: "new", label: "Sản phẩm mới" },
                { key: null, label: " Tất cả sản phẩm" },
              ].map((item) => (
                <li
                  key={String(item.key)}
                  onClick={() => setFilterType(item.key)}
                  className={`cursor-pointer hover:text-rose-500 ${
                    filterType === item.key
                      ? "text-rose-500 font-semibold"
                      : "text-slate-700"
                  }`}
                >
                  {item.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ===== GIÁ ===== */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm">
        <button
          onClick={() => setOpenPriceBox(!openPriceBox)}
          className="w-full flex justify-between items-center font-semibold text-sm"
        >
          Giá
          <ChevronDown
            size={18}
            className={`${openPriceBox ? "rotate-180" : ""} transition`}
          />
        </button>

        {openPriceBox && (
          <>
            {/* RADIO */}
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {[
                ["under100", "Dưới 100.000₫"],
                ["100-200", "100.000 - 200.000₫"],
                ["200-500", "200.000 - 500.000₫"],
                ["above500", "Trên 500.000₫"],
              ].map(([value, label]) => (
                <li key={value}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={filterPrice === value}
                      onClick={() =>
                        setFilterPrice(
                          filterPrice === value ? null : value
                        )
                      }
                      readOnly
                    />
                    <span>{label}</span>
                  </label>
                </li>
              ))}
            </ul>

            {/* SLIDER */}
            {showSliderPrice && (
              <div className="mt-4 space-y-2">
                <input
                  type="range"
                  min={0}
                  max={500000}
                  step={10000}
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([0, Number(e.target.value)])
                  }
                  className="w-full accent-rose-500"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>0đ</span>
                  <span>{priceRange[1].toLocaleString()}đ</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/*CLEAR FILTER  */}
      {onClearFilter && (
          <div className="bg-white border rounded-2xl p-4 shadow-sm">
            <button
              onClick={onClearFilter}
              className="w-full text-sm text-rose-500 font-medium hover:underline"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
    </div>
  );
}
