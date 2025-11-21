import { Cart } from "../models/Cart.js";
import { CartItem } from "../models/CartItem.js";


// LẤY GIỎ HÀNG

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    let [cart] = await Cart.getCartByUserId(userId);

    // Tạo cart nếu chưa tồn tại
    if (!cart.length) {
      await Cart.createCart(userId);
      [cart] = await Cart.getCartByUserId(userId);
    }

    const cartId = cart[0].CartID;

    const [items] = await CartItem.getItems(cartId);

    res.json({ cartId, items });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// THÊM SẢN PHẨM

export const addToCart = async (req, res) => {
  try {
    const { variantId, quantity = 1 } = req.body;
    const userId = req.user.id;

    if (!variantId)
      return res.status(400).json({ message: "Thiếu VariantID" });

    // lấy cart user
    let [[cart]] = await Cart.getCartByUserId(userId);

    if (!cart) {
      await Cart.createCart(userId);
      [[cart]] = await Cart.getCartByUserId(userId);
    }

    const cartId = cart.CartID;

    // kiểm tra tồn tại item
    const [[exist]] = await CartItem.findItem(cartId, variantId);

    if (exist) {
      await CartItem.updateQuantity(
        exist.CartItemID,
        exist.Quantity + quantity
      );
    } else {
      await CartItem.addItem(cartId, variantId, quantity);
    }

    res.json({ message: "Đã thêm vào giỏ hàng" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// UPDATE QUANTITY
export const updateCart = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cartItemId = req.params.id;

    if (!quantity || quantity < 1)
      return res.status(400).json({ message: "Số lượng không hợp lệ" });

    await CartItem.updateQuantity(cartItemId, quantity);

    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};


// XÓA ITEM
export const removeCartItem = async (req, res) => {
  try {
    await CartItem.removeItem(req.params.id);
    res.json({ message: "Đã xóa sản phẩm" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// MERGE LOCAL → DATABASE
export const mergeCart = async (req, res) => {
  try {
    const items = req.body.items || [];
    const userId = req.user.id;

    let [[cart]] = await Cart.getCartByUserId(userId);

    if (!cart) {
      await Cart.createCart(userId);
      [[cart]] = await Cart.getCartByUserId(userId);
    }

    const cartId = cart.CartID;

    for (const item of items) {
      if (!item.VariantID) continue;

      const [[exist]] = await CartItem.findItem(cartId, item.VariantID);

      if (exist) {
        await CartItem.updateQuantity(
          exist.CartItemID,
          exist.Quantity + item.quantity
        );
      } else {
        await CartItem.addItem(
          cartId,
          item.VariantID,
          item.quantity,
          item.price
        );
      }
    }

    res.json({ message: "Merge thành công" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
