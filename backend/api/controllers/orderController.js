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
import { decreaseStockProduct, CheckStockProduct } from "../models/variantsModel.js";
import { autoDeactivateProductIfOutOfStock } from "../models/productsModel.js";
import { sendInvoiceEmail } from "../config/sendInvoiceEmail.js";
import { createShippingOrder } from "../GHN/ghnService.js";
//TẠO ĐƠN HÀNG 
export const createOrderFromCart = async (req, res) => {
  const conn = await db.getConnection();
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

      // SHIPPING
      shippingMethod,
      shippingFee,
      to_district_id,
      to_ward_code,
    } = req.body;

    /* LẤY GIỎ HÀNG */
    const [cartRows] = await Cart.getCartByUserId(userId);
    if (!cartRows.length) {
      return res.status(400).json({ message: "Giỏ hàng trống" });
    }

    const cartId = cartRows[0].CartID;

    const [items] = await CartItem.getCartItems(cartId);
    if (!items.length) {
      return res.status(400).json({ message: "Giỏ hàng trống" });
    }

    /* CHECK TỒN KHO*/
    for (const item of items) {
      const stock = await CheckStockProduct(item.VariantID);
      if (stock < item.Quantity) {
        return res.status(400).json({
          message: `Sản phẩm '${item.ProductName}' chỉ còn ${stock} cái`,
        });
      }
    }

    /* TÍNH TỔNG TIỀN */
    const total =
      items.reduce(
        (sum, item) => sum + item.UnitPrice * item.Quantity,
        0
      ) -
      (discount || 0) +
      (shippingFee || 0);

    await conn.beginTransaction();

    /* TẠO ORDER NỘI BỘ  */
    const orderId = await createOrderModel({
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
    });

    /* TẠO ORDER GHN */
    const ghnRes = await createShippingOrder({
      to_name: receiverName,
      to_phone: phone,
      to_address: address,
      to_district_id: Number(to_district_id),
      to_ward_code: String(to_ward_code),

      items: items.map((i) => ({
        name: i.ProductName,
        quantity: i.Quantity,
        price: i.UnitPrice,
      })),

      cod_amount: paymentMethod === "cod" ? total : 0,
      service_type_id: shippingMethod === "fast" ? 2 : 1,
    });

    const ghnOrderCode = ghnRes?.data?.order_code;
    const expectedDeliveryTime = ghnRes?.data?.expected_delivery_time;

    /* UPDATE ORDER  GHN */
    if (ghnOrderCode) {
      await conn.query(
        `UPDATE orders
         SET ShippingProvider = 'GHN',
             ShippingCode = ?,
             ExpectedDeliveryTime = ?
         WHERE OrderID = ?`,
        [ghnOrderCode, expectedDeliveryTime || null, orderId]
      );
    }

    /* CHI TIẾT ĐƠN HÀNG */
    await createOrderItemsModel(orderId, items);

    /* TRỪ KHO */
    for (const item of items) {
      await decreaseStockProduct(item.VariantID, item.Quantity);
      await autoDeactivateProductIfOutOfStock(item.ProductID);
    }

    /* TRỪ VOUCHER  */
    if (voucherCode) {
      const voucher = await getVoucherByCode(voucherCode.trim());
      if (voucher) {
        await decreaseVoucherQuantity(voucher.VoucherID);
      }
    }

    /* XOÁ GIỎ HÀNG*/
    await conn.query("DELETE FROM cart_items WHERE CartID = ?", [cartId]);

    await conn.commit();
    conn.release();

    /*  GỬI EMAIL */
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

    return res.json({
      success: true,
      orderId,
      shippingCode: ghnOrderCode,
      expectedDeliveryTime,
    });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error("Lỗi createOrderFromCart:", err);
    return res.status(500).json({ message: "Lỗi server khi tạo đơn hàng" });
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
    console.error("Lỗi getMyOrders:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await getAllOrdersModel();
    res.json(orders);
  } catch (err) {
    console.error("Lỗi getAllOrders:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

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

export const updateOrderStatus = async (req, res) => {
  try {
    await updateOrderStatusModel(req.params.id, req.body.status);
    res.json({ success: true });
  } catch (err) {
    console.error("Lỗi updateOrderStatus:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    await deleteOrderModel(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("Lỗi deleteOrder:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
export const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    
    // Lấy thông tin đơn hàng
    const order = await getOrderDetailModel(orderId);
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    // Chỉ cho huỷ khi pending
    if (order.Status !== "pending") {
      return res.status(400).json({
        message: "Chỉ có thể huỷ đơn đang chờ xử lý",
      });
    }
    // Lấy item
    const items = await getOrderItemsModel(orderId);
    // Hoàn kho
    await restoreStockModel(items);
    // Hoàn voucher
    if (order.VoucherCode) {
      await restoreVoucherModel(order.VoucherCode);
    }
    // Hủy đơn
    await cancelOrderModel(orderId);
    res.json({ success: true, message: "Hủy đơn hàng thành công" });
  } catch (err) {
    console.error("Lỗi cancelOrder:", err);
    res.status(500).json({ message: "Lỗi server khi hủy đơn" });
  }
};
export const cancelOrderZalo = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await getOrderDetailModel(orderId);
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    if (order.Status !== "pending") {
      return res.status(400).json({
        message: "Chỉ có thể huỷ đơn đang chờ xử lý",
      });
    }
    const items = await getOrderItemsModel(orderId);

    await restoreStockModel(items);

    if (order.VoucherCode) {
      await restoreVoucherModel(order.VoucherCode);
    }

    const result = await cancelOrderZaloModel(orderId);

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "Không thể huỷ đơn ZaloPay" });
    }

    res.json({ success: true, message: "Hủy đơn hàng ZaloPay thành công" });
  } catch (err) {
    console.error("Lỗi cancelOrderZalo:", err);
    res.status(500).json({ message: "Lỗi server khi hủy đơn ZaloPay" });
  }
};