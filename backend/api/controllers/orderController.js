import db from "../config/db.js";
import { Cart } from "../models/CartModel.js";
import { CartItem } from "../models/CartItemModel.js";
import {
  createOrderModel,
  getAllOrdersModel,
  getOrderDetailModel,
  updateOrderStatusModel,
  deleteOrderModel,
  getOrderItemsModel,
  restoreStockModel,
  restoreVoucherModel,
  cancelOrderModel,
  cancelOrderZaloModel,
} from "../models/orderModel.js";
import { createOrderItemsModel } from "../models/orderItemModel.js";
import {
  getVoucherByCode,
  decreaseVoucherQuantity,
} from "../models/VoucherModel.js";
import {
  decreaseStockProduct,
  CheckStockProduct,
} from "../models/variantsModel.js";
import { autoDeactivateProductIfOutOfStock } from "../models/productsModel.js";
import {sendInvoiceEmail} from "../config/sendInvoiceEmail.js"

export const createOrderFromCart = async (req, res) => {
  const conn = await db.getConnection();
  let orderId;
  try {
    //  CHECK TOKEN
    if (!req.user?.id) {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }
    const userId = req.user.id;

    const {
      receiverName,
      phone,
      email,
      address,
      paymentMethod,
      note,
      voucherCode,
      discount = 0,

      // SHIPPING (FE ĐÃ TÍNH)
      shippingMethod,
      shippingFee = 0,
    } = req.body;

    // LẤY GIỎ HÀNG
    const [cartRows] = await Cart.getCartByUserId(userId);
    if (!cartRows.length) {
      return res.status(400).json({ message: "Giỏ hàng trống" });
    }
    const cartId = cartRows[0].CartID;

    const [items] = await CartItem.getCartItems(cartId);
    if (!items.length) {
      return res.status(400).json({ message: "Giỏ hàng trống" });
    }

    //  CHECK TỒN KHO
    for (const item of items) {
      const stock = await CheckStockProduct(item.VariantID);
      if (stock < item.Quantity) {
        return res.status(400).json({
          message: `Sản phẩm '${item.ProductName}' chỉ còn ${stock} cái`,
        });
      }
    }

    // TÍNH TIỀN
    const subtotal = items.reduce(
      (sum, item) => sum + item.UnitPrice * item.Quantity,
      0
    );

    const total = Math.max(
      0,
      subtotal - Number(discount) + Number(shippingFee)
    );
    const MAX_ORDER_AMOUNT = 5_000_000;
    if (total <= 0) {
      return res
        .status(400)
        .json({ message: "Tổng tiền đơn hàng không hợp lệ" });
    }
    if (total > MAX_ORDER_AMOUNT) {
      return res.status(400).json({
        message: `Tổng tiền đơn hàng vượt quá hạn mức ${MAX_ORDER_AMOUNT.toLocaleString("vi-VN")} VND`,
      });
    }

    // TRANSACTION
    await conn.beginTransaction();

    orderId = await createOrderModel(
      {
        userId,
        receiverName,
        phone,
        email,
        shippingAddress: address,
        paymentMethod,
        shippingMethod,
        shippingFee,
        note,
        voucherCode,
        discount,
        total,
      },
      conn
    );

    // ORDER ITEMS
    await createOrderItemsModel(orderId, items);
    
    // TRỪ KHO
    for (const item of items) {
      await decreaseStockProduct(item.VariantID, item.Quantity);
      await autoDeactivateProductIfOutOfStock(item.ProductID);
    }

    // TRỪ VOUCHER
    if (voucherCode) {
      const voucher = await getVoucherByCode(voucherCode.trim());
      if (voucher) {
        await decreaseVoucherQuantity(voucher.VoucherID);
      }
    }

    // XOÁ GIỎ
    await conn.query("DELETE FROM cart_items WHERE CartID = ?", [cartId]);

    await conn.commit();
    // GỬI EMAIL HOÁ ĐƠN
    try {
    await sendInvoiceEmail({
      receiverName,
      phone,
      email,
      address,
      total,
      paymentMethod,
      items: items.map((i) => ({
        ProductName: i.ProductName,
        Qty: i.Quantity,
        Price: i.UnitPrice,
      })),
    });
  } catch (emailErr) {
    console.error("Lỗi gửi email hoá đơn:", emailErr);
  }
    // TRẢ RESPONSE DUY NHẤT
    return res.json({
      success: true,
      orderId,
      message: "Đặt hàng thành công",
    });
  } catch (err) {
    console.error("Lỗi createOrderFromCart:", err);
    try {
      await conn.rollback();
    } catch {}
    return res.status(500).json({ message: "Lỗi server khi tạo đơn hàng" });
  } finally {
    conn.release();
  }
};
export const getMyOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      "SELECT * FROM orders WHERE UserID = ? ORDER BY CreatedAt DESC",
      [req.user.id]
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await getAllOrdersModel();
    res.json(orders);
  } catch {
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const getOrderDetail = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await getOrderDetailModel(id);
    if (!order) return res.status(404).json({});
    const items = await getOrderItemsModel(id);
    res.json({ order, items });
  } catch {
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    await updateOrderStatusModel(req.params.id, req.body.status);
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    await deleteOrderModel(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await getOrderDetailModel(orderId);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
    if (order.Status !== "pending") {
      return res
        .status(400)
        .json({ message: "Chỉ huỷ được đơn đang chờ xử lý" });
    }

    const items = await getOrderItemsModel(orderId);
    await restoreStockModel(items);

    if (order.VoucherCode) {
      await restoreVoucherModel(order.VoucherCode);
    }

    await cancelOrderModel(orderId);
    res.json({ success: true, message: "Huỷ đơn thành công" });
  } catch {
    res.status(500).json({ message: "Lỗi server khi huỷ đơn" });
  }
};

export const cancelOrderZalo = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await getOrderDetailModel(orderId);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
    if (order.Status !== "pending") {
      return res
        .status(400)
        .json({ message: "Chỉ huỷ được đơn đang chờ xử lý" });
    }

    const items = await getOrderItemsModel(orderId);
    await restoreStockModel(items);

    if (order.VoucherCode) {
      await restoreVoucherModel(order.VoucherCode);
    }

    await cancelOrderZaloModel(orderId);
    res.json({ success: true, message: "Huỷ đơn ZaloPay thành công" });
  } catch {
    res.status(500).json({ message: "Lỗi server" });
  }
};
