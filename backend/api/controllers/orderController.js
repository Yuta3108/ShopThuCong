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
      discount
    } = req.body;

    const [cartRows] = await Cart.getCartByUserId(userId);
    if (!cartRows.length) return res.status(400).json({ message: "Giỏ hàng trống!" });

    const cartId = cartRows[0].CartID;
    const [items] = await CartItem.getCartItems(cartId);
    if (!items.length) return res.status(400).json({ message: "Không có sản phẩm trong giỏ!" });

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

    await conn.query(`DELETE FROM cart_items WHERE CartID = ?`, [cartId]);

    await conn.commit();
    conn.release();

    res.json({ message: "Đặt hàng thành công!", orderId });
  } catch {
    res.status(500).json({ message: "Lỗi khi tạo đơn hàng." });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT * FROM orders WHERE UserID = ? ORDER BY CreatedAt DESC`,
      [req.user.id]
    );
    res.json({ message: "Lấy danh sách đơn hàng thành công!", data: orders });
  } catch {
    res.status(500).json({ message: "Lỗi khi lấy đơn hàng." });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await getAllOrdersModel();
    res.json({ message: "Lấy tất cả đơn hàng thành công!", data: orders });
  } catch {
    res.status(500).json({ message: "Lỗi khi lấy tất cả đơn hàng." });
  }
};

export const getOrderDetail = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await getOrderDetailModel(id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng!" });

    const items = await db.query(
      `SELECT * FROM order_items WHERE OrderID = ?`,
      [id]
    );

    res.json({
      message: "Lấy chi tiết đơn hàng thành công!",
      order,
      items: items[0],
    });
  } catch {
    res.status(500).json({ message: "Lỗi khi lấy chi tiết đơn hàng." });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    await updateOrderStatusModel(req.params.id, req.body.status);
    res.json({ message: "Cập nhật trạng thái thành công" });
  } catch {
    res.status(500).json({ message: "Lỗi khi cập nhật trạng thái" });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    await deleteOrderModel(req.params.id);
    res.json({ message: "Xóa đơn hàng thành công" });
  } catch {
    res.status(500).json({ message: "Lỗi khi xóa đơn hàng" });
  }
};
