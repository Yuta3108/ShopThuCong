import React from "react";
import { ChevronDown } from "lucide-react";

export default function ProductFilterSidebar({
    openCatBox,
    setOpenCatBox,
    openPriceBox,
    setOpenPriceBox,
    filterType,
    setFilterType,
    filterPrice,
    setFilterPrice,
}) {
    return (
        <div className="col-span-3 space-y-6">

            {/* DANH MỤC */}
            {setFilterType && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                    <button
                        onClick={() => setOpenCatBox(!openCatBox)}
                        className="w-full flex justify-between items-center font-semibold"
                    >
                        Danh mục sản phẩm
                        <ChevronDown
                            size={20}
                            className={`${openCatBox ? "rotate-180" : ""} transition`}
                        />
                    </button>

                    {openCatBox && (
                        <ul className="mt-4 space-y-2 text-gray-700 text-sm animate-fadeIn">
                            <li
                                onClick={() => setFilterType("hot")}
                                className={`cursor-pointer hover:text-pink-600 ${filterType === "hot" ? "text-pink-600 font-semibold" : ""
                                    }`}
                            >
                                Được mua nhiều
                            </li>

                            <li
                                onClick={() => setFilterType("new")}
                                className={`cursor-pointer hover:text-pink-600 ${filterType === "new" ? "text-pink-600 font-semibold" : ""
                                    }`}
                            >
                                Sản phẩm mới
                            </li>

                            <li
                                onClick={() => setFilterType(null)}
                                className={`cursor-pointer hover:text-pink-600 ${filterType === null ? "text-pink-600 font-semibold" : ""
                                    }`}
                            >
                                Tất cả sản phẩm
                            </li>
                        </ul>
                    )}
                </div>
            )}

            {/* GIÁ */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                <button
                    onClick={() => setOpenPriceBox(!openPriceBox)}
                    className="w-full flex justify-between items-center font-semibold"
                >
                    Giá
                    <ChevronDown
                        size={20}
                        className={`${openPriceBox ? "rotate-180" : ""} transition`}
                    />
                </button>

                {openPriceBox && (
                    <ul className="mt-4 space-y-3 text-sm text-gray-700 animate-fadeIn">
                        
                        <li>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="price"
                                    value="under100"
                                    checked={filterPrice === "under100"}
                                    onClick={() =>
                                        setFilterPrice(filterPrice === "under100" ? null : "under100")
                                    }
                                    readOnly
                                />
                                <span>Dưới 100.000₫</span>
                            </label>
                        </li>

                        <li>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="price"
                                    value="100-200"
                                    checked={filterPrice === "100-200"}
                                    onClick={() =>
                                        setFilterPrice(filterPrice === "100-200" ? null : "100-200")
                                    }
                                    readOnly
                                />
                                <span>100.000 - 200.000₫</span>
                            </label>
                        </li>

                        <li>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="price"
                                    value="200-500"
                                    checked={filterPrice === "200-500"}
                                    onClick={() =>
                                        setFilterPrice(filterPrice === "200-500" ? null : "200-500")
                                    }
                                    readOnly
                                />
                                <span>200.000 - 500.000₫</span>
                            </label>
                        </li>

                        <li>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="price"
                                    value="above500"
                                    checked={filterPrice === "above500"}
                                    onClick={() =>
                                        setFilterPrice(filterPrice === "above500" ? null : "above500")
                                    }
                                    readOnly
                                />
                                <span>Trên 500.000₫</span>
                            </label>
                        </li>

                    </ul>
                )}
            </div>
        </div>
    );
}
