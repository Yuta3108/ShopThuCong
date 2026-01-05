import db from "./db.js";
export const autoCancelPendingOrders = () => {
  setInterval(async () => {
    try {
      const [result] = await db.query(`
        UPDATE orders
        SET Status = 'cancelled'
        WHERE Status = 'pending'
          AND PaymentMethod = 'zalopay'
          AND CreatedAt < NOW() - INTERVAL 15 MINUTE
      `);

      if (result.affectedRows > 0) {
        console.log(
          `Auto-cancel ${result.affectedRows} đơn ZaloPay sau 15 phút`
        );
      }
    } catch (err) {
      console.error("Auto-cancel error:", err);
    }
  }, 60 * 1000); // mỗi 1 phút check
};