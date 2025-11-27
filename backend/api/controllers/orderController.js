import db from "../config/db.js";
import { Cart } from "../models/CartModel.js";
import { CartItem } from "../models/CartItemModel.js";
import {
  createOrderModel,
  getAllOrdersModel,
  getOrderDetailModel,
  updateOrderStatusModel,
  deleteOrderModel,
} from "../models/orderModel.js";
import { createOrderItemsModel } from "../models/orderItemModel.js";

// TẠO ĐƠN HÀNG TỪ GIỎ
export const createOrderFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      receiverName,
      phone,
      email,
      address,
      paymentMethod,
      note,
      voucherCode,
      discount,
    } = req.body;

    const [cartRows] = await Cart.getCartByUserId(userId);
    if (!cartRows.length) return res.status(400).json({});

    const cartId = cartRows[0].CartID;

    const [items] = await CartItem.getCartItems(cartId);
    if (!items.length) return res.status(400).json({});

    const total =
      items.reduce((sum, item) => sum + item.UnitPrice * item.Quantity, 0) -
      (discount || 0);

    const conn = await db.getConnection();
    await conn.beginTransaction();

    const orderId = await createOrderModel({
      userId,
      receiverName,
      phone,
      email,
      shippingAddress: address,
      paymentMethod,
      note,
      voucherCode,
      discount,
      total,
    });

    await createOrderItemsModel(orderId, items);

    // clear cart
    await conn.query("DELETE FROM cart_items WHERE CartID = ?", [cartId]);

    await conn.commit();
    conn.release();

    res.json({ orderId });
  } catch {
    res.status(500).json({});
  }
};

// LẤY ĐƠN HÀNG CỦA USER
export const getMyOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      "SELECT * FROM orders WHERE UserID = ? ORDER BY CreatedAt DESC",
      [req.user.id]
    );

    res.json(orders); // trả thẳng mảng
  } catch {
    res.status(500).json({});
  }
};

// LẤY TẤT CẢ ĐƠN HÀNG (ADMIN)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await getAllOrdersModel();
    res.json(orders); // trả thẳng mảng
  } catch {
    res.status(500).json({});
  }
};

// LẤY CHI TIẾT 1 ĐƠN
export const getOrderDetail = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await getOrderDetailModel(id);

    if (!order) return res.status(404).json({});

    const [items] = await db.query(
      "SELECT * FROM order_items WHERE OrderID = ?",
      [id]
    );

    res.json({ order, items });
  } catch {
    res.status(500).json({});
  }
};
// CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
export const updateOrderStatus = async (req, res) => {
  try {
    await updateOrderStatusModel(req.params.id, req.body.status);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// XOÁ ĐƠN HÀNG
export const deleteOrder = async (req, res) => {
  try {
    await deleteOrderModel(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({});
  }
};
