import db from "../config/db.js";
import { Cart } from "../models/CartModel.js";
import { CartItem } from "../models/CartItemModel.js";

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
    // 1. Lấy cart theo user
    const [cartRows] = await Cart.getCartByUserId(userId);
    if (!cartRows.length) {
      return res.status(400).json({ message: "Giỏ hàng trống!" });
    }

    const cartId = cartRows[0].CartID;
    // 2. Lấy tất cả items
    const [items] = await CartItem.getCartItems(cartId);
    if (!items.length)
      return res.status(400).json({ message: "Không có sản phẩm trong giỏ!" });

    // 3. Tính tổng tiền
    const subtotal = items.reduce(
      (sum, item) => sum + item.UnitPrice * item.Quantity,
      0
    );
    const total = subtotal - (discount || 0);

    const connection = await db.getConnection();
    await connection.beginTransaction();

    // 4. Tạo ORDER trước
    const [orderRes] = await connection.query(
      `INSERT INTO orders
        (UserID, ReceiverName, Phone,Email, ShippingAddress, PaymentMethod, 
         IsPaid, Total, Status, Note, VoucherCode, Discount, CreatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        userId,
        receiverName,
        phone,
        email,
        address,
        paymentMethod,
        0,
        total,
        "pending",
        note || null,
        voucherCode || null,
        discount || 0
      ]
    );

    const orderId = orderRes.insertId;
    // 5. Insert order_items
    for (const item of items) {
      await connection.query(
        `INSERT INTO order_items
          (OrderID, VariantID, ProductName, Quantity, UnitPrice, TotalPrice)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.VariantID,
          item.ProductName,
          item.Quantity,
          item.UnitPrice,
          item.UnitPrice * item.Quantity
        ]
      );
    }
    // 6. Xóa giỏ hàng sau khi đặt đơn
    await connection.query(
      `DELETE FROM cart_items WHERE CartID = ?`,
      [cartId]
    );

    await connection.commit();
    res.json({
      message: "Đặt hàng thành công!",
      orderId
    });

  } catch (err) {
    console.error("ORDER ERROR:", err);
    res.status(500).json({ message: "Lỗi khi tạo đơn hàng." });
  }
};
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const [orders] = await db.query(
      `SELECT * FROM orders 
       WHERE UserID = ?
       ORDER BY CreatedAt DESC`,
      [userId]
    );

    res.json({
      message: "Lấy danh sách đơn hàng thành công!",
      data: orders
    });

  } catch (err) {
    console.error("GET MY ORDERS ERROR:", err);
    res.status(500).json({ message: "Lỗi khi lấy danh sách đơn hàng." });
  }
};
export const getOrderDetail = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

    // Kiểm tra order có thuộc về user không
    const [[order]] = await db.query(
      `SELECT * FROM orders WHERE OrderID = ? AND UserID = ?`,
      [orderId, userId]
    );

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng!" });
    }

    // Lấy danh sách sản phẩm trong order
    const [items] = await db.query(
      `SELECT * FROM order_items WHERE OrderID = ?`,
      [orderId]
    );

    res.json({
      message: "Lấy chi tiết đơn hàng thành công!",
      order,
      items
    });

  } catch (err) {
    console.error("GET ORDER DETAIL ERROR:", err);
    res.status(500).json({ message: "Lỗi khi lấy chi tiết đơn hàng." });
  }
};
export const getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT 
          OrderID,
          UserID,
          ReceiverName,
          Phone,
          Email,
          ShippingAddress,
          PaymentMethod,
          IsPaid,
          Total,
          Status,
          VoucherCode,
          Discount,
          CreatedAt,
          UpdatedAt
       FROM orders
       ORDER BY CreatedAt DESC`
    );

    res.json({
      message: "Lấy tất cả đơn hàng thành công!",
      data: orders,
    });

  } catch (err) {
    console.error("GET ALL ORDERS ERROR:", err);
    res.status(500).json({ message: "Lỗi khi lấy tất cả đơn hàng." });
  }
};