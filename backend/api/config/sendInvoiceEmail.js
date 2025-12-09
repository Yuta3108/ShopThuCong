import nodemailer from "nodemailer";

export const sendInvoiceEmail = async (order) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const html = `
  <div style="font-family:Arial, sans-serif;background:#f5f6f7;padding:20px;">
    <div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;
      overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">

      <div style="background:#1A94FF;padding:20px;text-align:center;color:white;">
        <h2 style="margin:0;font-size:22px;">XÁC NHẬN ĐƠN HÀNG</h2>
        <p>Cảm ơn bạn đã mua hàng tại Then Fong Store!</p>
      </div>

      <div style="padding:20px;">
        <h3 style="color:#1A94FF;">Thông tin giao hàng</h3>
        <p><strong>Họ tên:</strong> ${order.receiverName}</p>
          <p><strong>Email:</strong> ${order.email}</p>
          <p><strong>SĐT:</strong> ${order.phone}</p>
          <p><strong>Địa chỉ:</strong> ${order.address}</p>
          <p><strong>Phương thức thanh toán:</strong> ${order.paymentMethod}</p>
      </div>

      <div style="padding:20px;">
        <h3 style="color:#1A94FF;">Chi tiết đơn hàng</h3>
        
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#e8f4ff;">
              <th style="padding:10px;text-align:left;">Sản phẩm</th>
              <th style="padding:10px;text-align:center;">SL</th>
              <th style="padding:10px;text-align:right;">Giá</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                (item) => `
                <tr style="border-bottom:1px solid #ddd;">
                  <td style="padding:10px;">${item.ProductName}</td>
                  <td style="padding:10px;text-align:center;">${item.Qty}</td>
                  <td style="padding:10px;text-align:right;">
                    ${Number(item.Price).toLocaleString()}₫
                  </td>
                </tr>`
              )
              .join("")}
          </tbody>
        </table>

        <h2 style="text-align:right;margin-top:20px;">
          Tổng cộng: <span style="color:#1A94FF;">
          ${Number(order.total).toLocaleString()}₫</span>
        </h2>
      </div>

      <div style="background:#e8f4ff;padding:15px;text-align:center;color:#666;font-size:14px;">
        © 2025 Then Fong Store – Cảm ơn bạn đã ủng hộ chúng tôi!
      </div>

    </div>
  </div>
  `;

  await transporter.sendMail({
    from: `"Then Fong Store" <${process.env.MAIL_USER}>`,
    to: order.email,
    subject: "Xác nhận đơn hàng",
    html,
  });
};
