

import pool from "./dbService.js";

async function getQuantity(received_goods_id, si_number, quantity) {
    try {
      if (!received_goods_id || !si_number) {
        throw new Error("Missing required parameters");
      }

      const query = `
      SELECT 
      received_goods_items.SI_number,
      received_goods_items.received_goods_id,
      COALESCE(SUM(received_goods_items.Quantity), 0) AS totalQuantity
  FROM received_goods_items
  LEFT JOIN purchase_order_items ON 
      received_goods_items.SI_number = purchase_order_items.SI_number
  WHERE received_goods_items.received_goods_id = ? 
      AND received_goods_items.SI_number = ?
  GROUP BY received_goods_items.SI_number, received_goods_items.received_goods_id;
  
    `;
  
      const [result] = await pool.promise().query(query, [received_goods_id, si_number]);
  

      if (result.length > 0) {
        var { totalQuantity, orderQuantity } = result[0];
        totalQuantity=totalQuantity+quantity
        const isAboveOrderQuantity = totalQuantity > orderQuantity;
        return { totalQuantity, orderQuantity, isAboveOrderQuantity };
      } else {
        throw new Error("No matching items found for the provided parameters");
      }
    } catch (error) {
      console.error("Error fetching matching items:", error);
      throw error;
    }
  }
export { getQuantity };