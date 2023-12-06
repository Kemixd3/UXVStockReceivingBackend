import pool from "./dbService.js";

async function getQuantity(
  received_goods_id,
  si_number,
  quantity,
  received_item_id
) {
  try {
    if (!received_goods_id || !si_number) {
      throw new Error("Missing required parameters");
    }

    const query = `
      SELECT 
      received_goods_items.SI_number,
      received_goods_items.received_goods_id,
      COALESCE(SUM(received_goods_items.Quantity), 0) AS totalQuantity,
      COALESCE(
          (
              SELECT SUM(purchase_order_items.Quantity) 
              FROM purchase_order_items 
              WHERE received_goods_items.SI_number = purchase_order_items.SI_number
              LIMIT 1
          ), 0
      ) AS orderQuantity
  FROM received_goods_items
  WHERE received_goods_items.received_goods_id = ? 
      AND received_goods_items.SI_number = ?
      AND received_goods_items.received_item_id != ? -- Exclude the specific received_item_id
  GROUP BY received_goods_items.SI_number, received_goods_items.received_goods_id;
  
    `;

    const [result] = await pool
      .promise()
      .query(query, [received_goods_id, si_number, received_item_id]);

    if (result.length > 0) {
      var { totalQuantity, orderQuantity } = result[0];

      // Convert to integers
      totalQuantity = parseInt(totalQuantity, 10);
      orderQuantity = parseInt(orderQuantity, 10);

      totalQuantity = totalQuantity + quantity;

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
export default getQuantity;
