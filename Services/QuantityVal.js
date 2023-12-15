import pool from "./dbService.js";

//messy util to handle quantity validation for put and post received_order_items on a specific order
async function getQuantity(
  received_goods_id,
  si_number,
  quantity,
  received_item_id,
  purchase_order_id
) {
  try {
    if (!received_goods_id || !si_number) {
      throw new Error("Missing required parameters");
    }
    console.log(
      purchase_order_id,
      received_goods_id,
      si_number,
      received_item_id
    );
    const query = `
      SELECT 
        COALESCE(SUM(rgi.Quantity), 0) AS totalQuantity,
        COALESCE((
          SELECT SUM(poi.Quantity) 
          FROM purchase_order_items poi
          WHERE rgi.SI_number = poi.SI_number AND poi.order_id = ?
          LIMIT 1
        ), 0) AS orderQuantity
      FROM received_goods_items rgi
      WHERE rgi.received_goods_id = ? 
        AND rgi.SI_number = ?
     
      GROUP BY rgi.SI_number, rgi.received_goods_id;
    `;
    const [result] = await pool
      .promise()
      .query(query, [
        purchase_order_id,
        received_goods_id,
        si_number,
        received_item_id,
      ]);

    console.log(result);

    if (result.length <= 0) {
      const query = `
        SELECT 
          COALESCE(SUM(rgi.Quantity), 0) AS totalQuantity1,
          COALESCE((
            SELECT SUM(poi.Quantity) 
            FROM purchase_order_items poi
            WHERE rgi.SI_number = poi.SI_number AND poi.order_id = ?
            LIMIT 1
          ), 0) AS orderQuantity1
        FROM received_goods_items rgi
        WHERE rgi.received_goods_id = ? 
          AND rgi.SI_number = ?
    
        GROUP BY rgi.SI_number, rgi.received_goods_id;
      `;
      const [result] = await pool
        .promise()
        .query(query, [purchase_order_id, received_goods_id, si_number]);
      if (result.length > 0) {
        const { totalQuantity1, orderQuantity1 } = result[0];
        const combinedQuantity = parseInt(totalQuantity1) + quantity;
        const isAboveLimit = combinedQuantity > orderQuantity1;
        if (isAboveLimit) {
          return {
            totalQuantity: totalQuantity1,
            orderQuantity: orderQuantity1,
            isAboveOrderQuantity: true,
          };
        }
      }
    }

    if (result.length > 0) {
      const { totalQuantity, orderQuantity } = result[0];
      const parsedTotalQuantity = parseInt(totalQuantity) + quantity;
      const parsedOrderQuantity = parseInt(orderQuantity);
      const isAboveOrderQuantity = parsedTotalQuantity > parsedOrderQuantity;
      return {
        totalQuantity: parsedTotalQuantity,
        orderQuantity: parsedOrderQuantity,
        isAboveOrderQuantity,
      };
    } else if (result.length < 1) {
      return {
        totalQuantity: 0,
        orderQuantity: 0,
        isAboveOrderQuantity: false,
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
