import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowLeft } from "lucide-react";
import Header from "../Layout/Header";
import Footer from "../Layout/Footer";

export default function CartPage() {
    const [cart, setCart] = useState([]);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(saved);
    }, []);

    const saveCart = (newCart) => {
        setCart(newCart);
        localStorage.setItem("cart", JSON.stringify(newCart));
    };

    const increaseQty = (variantId) => {
        saveCart(
            cart.map((item) =>
                item.VariantID === variantId
                    ? { ...item, quantity: Number(item.quantity) + 1 }
                    : item
            )
        );
    };

    const decreaseQty = (variantId) => {
        saveCart(
            cart
                .map((item) =>
                    item.VariantID === variantId
                        ? { ...item, quantity: Math.max(1, Number(item.quantity) - 1) }
                        : item
                )
                .filter((i) => i.quantity > 0)
        );
    };

    const removeItem = (variantId) => {
        saveCart(cart.filter((item) => item.VariantID !== variantId));
    };

    const total = cart.reduce(
        (sum, i) => sum + Number(i.price) * Number(i.quantity),
        0
    );

    return (
        <div className="bg-[#F5F5F5] min-h-screen flex flex-col">
            <Header />

            <div className="container mx-auto px-4 mt-8 flex-1">

                <Link
                    to="/san-pham"
                    className="flex items-center text-gray-600 hover:text-[#C2185B] mb-6 transition-all"
                >
                    <ArrowLeft size={18} className="mr-1" />
                    Tiếp tục mua sắm
                </Link>

                <h1 className="text-3xl font-bold mb-6 text-gray-900">
                    Giỏ hàng của bạn
                </h1>

                {cart.length === 0 ? (
                    <div className="text-center py-20 text-gray-600">
                        Giỏ hàng đang trống…
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">

                        {/* LIST ITEMS */}
                        <div className="lg:col-span-2 space-y-4">
                            {cart.map((item) => (
                                <div
                                    key={item.VariantID}
                                    className="bg-white rounded-xl shadow p-4 flex items-center gap-4 hover:shadow-lg transition-all"
                                >
                                    <img
                                        src={item.ImageURL}
                                        className="w-24 h-24 object-cover rounded-xl shadow-sm"
                                    />

                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">
                                            {item.ProductName}
                                        </h3>

                                        <p className="text-[#C2185B] font-bold mt-1">
                                            {Number(item.price).toLocaleString()}₫
                                        </p>

                                        {/* QUANTITY */}
                                        <div className="flex items-center gap-3 mt-4">
                                            <button
                                                onClick={() => decreaseQty(item.VariantID)}
                                                className="w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-all hover:scale-110"
                                            >
                                                <Minus size={16} />
                                            </button>

                                            <span className="w-10 text-center font-semibold text-gray-800">
                                                {item.quantity}
                                            </span>

                                            <button
                                                onClick={() => increaseQty(item.VariantID)}
                                                className="w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-all hover:scale-110"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => removeItem(item.VariantID)}
                                        className="text-red-500 hover:text-red-700 hover:scale-110 transition-all"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* SUMMARY */}
                        <div className="bg-white p-6 rounded-2xl shadow h-fit border">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                Tổng cộng
                            </h2>

                            <div className="flex justify-between mb-3 text-gray-700">
                                <span>Tạm tính</span>
                                <span>{total.toLocaleString()}₫</span>
                            </div>

                            <hr className="my-3" />

                            <div className="flex justify-between text-xl font-bold text-[#C2185B] mb-4">
                                <span>Tổng tiền</span>
                                <span>{total.toLocaleString()}₫</span>
                            </div>

                            <button className="w-full py-3 bg-[#C2185B] text-white rounded-xl text-lg font-semibold hover:bg-[#a6144c] transition-all shadow-md hover:shadow-lg">
                                Thanh toán ngay
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
