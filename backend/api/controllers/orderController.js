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

// ⭐ THÊM IMPORT VOUCHER Ở ĐÂY
import {
  getVoucherByCode,
  decreaseVoucherQuantity,
} from "../models/VoucherModel.js";

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

    // Lấy giỏ hàng theo user
    const [cartRows] = await Cart.getCartByUserId(userId);
    if (!cartRows.length) return res.status(400).json({});

    const cartId = cartRows[0].CartID;

    // Lấy item trong giỏ
    const [items] = await CartItem.getCartItems(cartId);
    if (!items.length) return res.status(400).json({});

    // Tính tổng tiền sau khi trừ discount (nếu có)
    const total =
      items.reduce((sum, item) => sum + item.UnitPrice * item.Quantity, 0) -
      (discount || 0);

    const conn = await db.getConnection();
    await conn.beginTransaction();

    // Tạo đơn hàng
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

    // Tạo chi tiết đơn hàng
    await createOrderItemsModel(orderId, items);
    if (voucherCode) {
      try {
        const voucher = await getVoucherByCode(voucherCode.trim());
        if (voucher) {
          await decreaseVoucherQuantity(voucher.VoucherID);
        }
      } catch (err) {
        console.error("Lỗi khi giảm lượt voucher:", err);
      }
    }
    // Xóa giỏ hàng sau khi tạo đơn thành công
    await conn.query("DELETE FROM cart_items WHERE CartID = ?", [cartId]);
    await conn.commit();
    conn.release();
    res.json({ orderId });
  } catch (err) {
    console.error("Lỗi createOrderFromCart:", err);
    res.status(500).json({ message: "Lỗi server khi tạo đơn hàng" });
  }
};

// LẤY ĐƠN HÀNG CỦA USER
export const getMyOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      "SELECT * FROM orders WHERE UserID = ? ORDER BY CreatedAt DESC",
      [req.user.id]
    );

    res.json(orders); 
  } catch (err) {
    console.error("Lỗi getMyOrders:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// LẤY TẤT CẢ ĐƠN HÀNG (ADMIN)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await getAllOrdersModel();
    res.json(orders);
  } catch (err) {
    console.error("Lỗi getAllOrders:", err);
    res.status(500).json({ message: "Lỗi server" });
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
  } catch (err) {
    console.error("Lỗi getOrderDetail:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
export const updateOrderStatus = async (req, res) => {
  try {
    await updateOrderStatusModel(req.params.id, req.body.status);
    res.json({ success: true });
  } catch (err) {
    console.error("Lỗi updateOrderStatus:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// XOÁ ĐƠN HÀNG
export const deleteOrder = async (req, res) => {
  try {
    await deleteOrderModel(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("Lỗi deleteOrder:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
