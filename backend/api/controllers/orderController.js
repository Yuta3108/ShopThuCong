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

      // SHIPPING 
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
  const conn = await db.getConnection();
  try {
    const { orderId } = req.params;

    await conn.beginTransaction();

    const orderDetail = await getOrderDetailModel(orderId, conn);
    const order = orderDetail?.order;

    if (!order) {
      await conn.rollback();
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (order.Status !== "pending") {
      await conn.rollback();
      return res
        .status(400)
        .json({ message: "Chỉ huỷ được đơn đang chờ xử lý" });
    }

    const items = await getOrderItemsModel(orderId, conn);
    await restoreStockModel(items, conn);

    if (order.VoucherCode) {
      await restoreVoucherModel(order.VoucherCode, conn);
    }

    await cancelOrderZaloModel(orderId, conn);

    await conn.commit();
    res.json({ success: true, message: "Huỷ đơn ZaloPay thành công" });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: "Lỗi server" });
  } finally {
    conn.release();
  }
};
export const statisticOrderByStatus = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT Status, COUNT(*) AS Total
      FROM orders
      GROUP BY Status
    `);

    res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error("Statistic error:", err);
    res.status(500).json({ success: false });
  }
};
export const dashboardSummary = async (req, res) => {
  //  THÁNG HIỆN TẠI 
  const [[current]] = await db.query(`
    SELECT
      COUNT(*) AS totalOrders,
      SUM(CASE WHEN Status = 'completed' THEN total ELSE 0 END) AS totalRevenue,
      COUNT(DISTINCT userId) AS totalCustomers
    FROM orders
    WHERE MONTH(createdAt) = MONTH(CURRENT_DATE())
      AND YEAR(createdAt) = YEAR(CURRENT_DATE())
  `);

  //  THÁNG TRƯỚC 
  const [[previous]] = await db.query(`
    SELECT
      COUNT(*) AS totalOrders,
      SUM(CASE WHEN Status = 'completed' THEN total ELSE 0 END) AS totalRevenue,
      COUNT(DISTINCT userId) AS totalCustomers
    FROM orders
    WHERE MONTH(createdAt) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH)
      AND YEAR(createdAt) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)
  `);

  //  HÔM NAY 
  const [[today]] = await db.query(`
    SELECT COUNT(*) AS todayOrders
    FROM orders
    WHERE DATE(createdAt) = CURDATE()
  `);

  //  FORMAT & SAFE NUMBER 
  const curOrders = Number(current.totalOrders) || 0;
  const preOrders = Number(previous.totalOrders) || 0;

  const curRevenue = Number(current.totalRevenue) || 0;
  const preRevenue = Number(previous.totalRevenue) || 0;

  const curCustomers = Number(current.totalCustomers) || 0;
  const preCustomers = Number(previous.totalCustomers) || 0;

  const todayOrders = Number(today.todayOrders) || 0;

  //  % GROWTH 
  const calcGrowth = (cur, pre) =>
    pre === 0 ? 0 : Number((((cur - pre) / pre) * 100).toFixed(1));

  res.json({
    success: true,
    data: {
      totalOrders: curOrders,
      totalRevenue: curRevenue,
      totalCustomers: curCustomers,
      todayOrders,

      orderGrowth: calcGrowth(curOrders, preOrders),
      revenueGrowth: calcGrowth(curRevenue, preRevenue),
      customerGrowth: calcGrowth(curCustomers, preCustomers),
    },
  });
};

export const revenueByMonth = async (req, res) => {
  const [rows] = await db.query(`
    SELECT 
      DATE_FORMAT(createdAt, '%Y-%m') AS month,
      SUM(total) AS revenue
    FROM orders
    WHERE Status = 'completed'
    GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
    ORDER BY month;
  `);
  res.json({ success: true, data: rows });
};
export const topSellingProducts = async (req, res) => {
  const [rows] = await db.query(`
    SELECT 
      p.ProductID AS productId,
      p.ProductName AS name,
      p.ImageURL AS imageUrl,
      SUM(oi.quantity) AS sold
    FROM order_items oi
    JOIN product_variants pv ON oi.VariantID = pv.VariantID
    JOIN products p ON pv.ProductID = p.ProductID
    JOIN orders o ON oi.OrderID = o.OrderID
    WHERE o.Status = 'completed'
    GROUP BY p.ProductID, p.ProductName
    ORDER BY sold DESC
    LIMIT 5
  `);

  res.json({ success: true, data: rows });
};
export const latestOrder = async (req, res) => {
  const [[row]] = await db.query(`
    SELECT OrderID
    FROM orders
    ORDER BY OrderID DESC
    LIMIT 1
  `);

  res.json({
    success: true,
    orderId: row?.OrderID || null,
  });
};
export const revenueByTime = async (req, res) => {
  try {
    const { type = "month" } = req.query;
    let sql = "";

    switch (type) {
      case "day":
        sql = `
        WITH RECURSIVE days AS (
          SELECT CURDATE() - INTERVAL 6 DAY AS d
          UNION ALL
          SELECT d + INTERVAL 1 DAY
          FROM days
          WHERE d < CURDATE()
        )
        SELECT
          DATE_FORMAT(days.d, '%d/%m/%Y') AS label,
          COALESCE(SUM(o.total), 0) AS value
        FROM days
        LEFT JOIN orders o
          ON DATE(o.CreatedAt) = days.d
          AND o.Status = 'completed'
        GROUP BY days.d
        ORDER BY days.d
      `;
    break;

      case "month":
        sql = `
          SELECT 
            DATE_FORMAT(CreatedAt, '%Y-%m') AS label,
            SUM(total) AS value
          FROM orders
          WHERE Status = 'completed'
          GROUP BY DATE_FORMAT(CreatedAt, '%Y-%m')
          ORDER BY label
        `;
        break;

      case "quarter":
        sql = `
          SELECT 
            YEAR(CreatedAt) AS year,
            QUARTER(CreatedAt) AS quarter,
            SUM(total) AS value
          FROM orders
          WHERE Status = 'completed'
            AND CreatedAt IS NOT NULL
          GROUP BY YEAR(CreatedAt), QUARTER(CreatedAt)
          ORDER BY YEAR(CreatedAt), QUARTER(CreatedAt)
        `;
        break;

      case "year":
        sql = `
          SELECT 
            YEAR(CreatedAt) AS label,
            SUM(total) AS value
          FROM orders
          WHERE Status = 'completed'
          GROUP BY YEAR(CreatedAt)
          ORDER BY label
        `;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "type không hợp lệ (day | month | quarter | year)",
        });
    }

    const [rows] = await db.query(sql);
    let labels = [];
    let values = [];
    if (type === "quarter") {
      labels = rows.map(r => `Q${r.quarter}/${r.year}`);
      values = rows.map(r => Number(r.value));
    } else {
      labels = rows.map(r => r.label);
      values = rows.map(r => Number(r.value));
    }
    res.json({
      success: true,
      type,
      labels,
      values,
      raw: rows,
    });

  } catch (err) {
    console.error("Revenue stats error:", err);
    res.status(500).json({ success: false });
  }
};