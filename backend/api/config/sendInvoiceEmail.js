import nodemailer from "nodemailer";
import fs from "fs";

export const sendInvoiceEmail = async (order, pdfPath) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  // HTML TEMPLATE 
  const htmlContent = `
  <div style="font-family: Arial, sans-serif; background:#f5f6f7; padding:20px;">
    <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.1);">

      <!-- HEADER -->
      <div style="background:#1A94FF; padding:20px; color:white; text-align:center;">
        <h2 style="margin:0; font-size:22px;">HÓA ĐƠN ĐIỆN TỬ</h2>
        <p style="margin:5px 0 0; opacity:.9;">Cảm ơn bạn đã mua hàng tại ShopQuanao</p>
      </div>

      <!-- CUSTOMER INFO -->
      <div style="padding:20px;">
        <h3 style="margin-top:0; color:#1A94FF;">Thông tin khách hàng</h3>
        <p><strong>Khách hàng:</strong> ${order.receiverName}</p>
        <p><strong>Email:</strong> ${order.email}</p>
        <p><strong>SĐT:</strong> ${order.phone}</p>
        <p><strong>Địa chỉ:</strong> ${order.address}</p>
      </div>

      <!-- ORDER ITEMS -->
      <div style="padding:20px;">
        <h3 style="margin-top:0; color:#1A94FF;">Chi tiết đơn hàng</h3>

        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr style="background:#f0f8ff;">
              <th style="padding:10px; text-align:left; border-bottom:1px solid #ddd;">Sản phẩm</th>
              <th style="padding:10px; text-align:center; border-bottom:1px solid #ddd;">SL</th>
              <th style="padding:10px; text-align:right; border-bottom:1px solid #ddd;">Giá</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                (item) => `
              <tr>
                <td style="padding:10px; border-bottom:1px solid #eee;">${item.ProductName}</td>
                <td style="padding:10px; text-align:center; border-bottom:1px solid #eee;">${item.Qty}</td>
                <td style="padding:10px; text-align:right; border-bottom:1px solid #eee;">
                  ${Number(item.Price).toLocaleString()}₫
                </td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>

        <h3 style="text-align:right; margin-top:20px; font-size:20px; color:#333;">
          Tổng tiền: 
          <span style="color:#1A94FF;">${Number(order.total).toLocaleString()}₫</span>
        </h3>
      </div>

      <!-- DOWNLOAD PDF -->
      <div style="padding:20px; text-align:center;">
        <a href="#" 
           style="display:inline-block; padding:12px 20px; background:#1A94FF; color:white; text-decoration:none; border-radius:8px; font-size:16px;">
          📄 Tải hóa đơn PDF
        </a>
      </div>

      <!-- FOOTER -->
      <div style="background:#f0f8ff; padding:15px; text-align:center; font-size:14px; color:#555;">
        <p style="margin:0;">ShopQuanao &copy; 2025</p>
        <p style="margin:5px 0 0;">Cảm ơn bạn đã tin tưởng mua hàng tại cửa hàng của chúng tôi 💙</p>
      </div>

    </div>
  </div>
  `;

  await transporter.sendMail({
    from: `"ShopQuanao" <${process.env.MAIL_USER}>`,
    to: order.email,
    subject: "Hóa đơn điện tử đơn hàng của bạn",
    html: htmlContent,
    attachments: [
      {
        filename: "hoadon.pdf",
        path: pdfPath,
      },
    ],
  });
};
