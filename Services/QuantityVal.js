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
        COALESCE(SUM(rgi.Quantity), 0) AS totalQuantity,
        COALESCE((
          SELECT SUM(poi.Quantity) 
          FROM purchase_order_items poi
          WHERE rgi.SI_number = poi.SI_number
          LIMIT 1
        ), 0) AS orderQuantity
      FROM received_goods_items rgi
      WHERE rgi.received_goods_id = ? 
        AND rgi.SI_number = ?
        AND rgi.received_item_id != ? 
      GROUP BY rgi.SI_number, rgi.received_goods_id;
    `;

    const [result] = await pool
      .promise()
      .query(query, [received_goods_id, si_number, received_item_id]);

    if (result.length > 0) {
      const { totalQuantity, orderQuantity } = result[0];

      const parsedTotalQuantity = parseInt(totalQuantity, 10);
      const parsedOrderQuantity = parseInt(orderQuantity, 10);

      const updatedTotalQuantity = parsedTotalQuantity + quantity;
      const isAboveOrderQuantity = updatedTotalQuantity > parsedOrderQuantity;

      return {
        totalQuantity: updatedTotalQuantity,
        orderQuantity: parsedOrderQuantity,
        isAboveOrderQuantity,
      };
    } else {
      //Handle case where no matching items are found or result is empty
      const isAboveOrderQuantity = quantity > 0;

      return {
        totalQuantity: quantity,
        orderQuantity: 0,
        isAboveOrderQuantity,
      };
    }
  } catch (error) {
    console.error("Error fetching matching items:", error);
    throw error;
  }
}

export default getQuantity;
