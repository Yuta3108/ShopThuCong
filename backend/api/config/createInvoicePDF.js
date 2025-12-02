import PDFDocument from "pdfkit";
import fs from "fs";

export const createInvoicePDF = (order, filePath) => {
  return new Promise((resolve) => {
    const doc = new PDFDocument();

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).text("HÓA ĐƠN ĐIỆN TỬ", { align: "center" });
    doc.moveDown();

    //  THÔNG TIN KHÁCH 
    doc.fontSize(12).text(`Khách hàng: ${order.receiverName}`);
    doc.text(`Email: ${order.email}`);
    doc.text(`SĐT: ${order.phone}`);
    doc.text(`Địa chỉ: ${order.address}`);
    doc.moveDown();

    // BẢNG SẢN PHẨM
    doc.fontSize(14).text("Chi tiết đơn hàng:");
    doc.moveDown();

    order.items.forEach((item) => {
      doc
        .fontSize(12)
        .text(
          `${item.ProductName} - SL: ${item.Qty} - ${Number(item.Price).toLocaleString()}₫`
        );
    });

    doc.moveDown();

    // TỔNG TIỀN 
    doc.fontSize(14).text(`Tổng tiền: ${Number(order.total).toLocaleString()}₫`, {
      align: "right",
    });

    doc.end();

    stream.on("finish", () => resolve(filePath));
  });
};
