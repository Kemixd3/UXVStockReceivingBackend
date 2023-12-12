import { Router } from "express";
import pool from "../Services/dbService.js";

const SearchController = Router();

SearchController.get(
  "/search/:searchTerm/:selectedCategory",
  async (req, res) => {
    try {
      var { searchTerm, selectedCategory } = req.params;

      let query, queryParams; // Declare query and queryParams here

      switch (selectedCategory) {
        case "po":
          if (searchTerm !== "-1") {
            query = `SELECT order_id AS \`Order\`, order_date AS \`Ordered\`, Buyer AS \`Ordered_By\`, expected_arrival AS \`Expected_Arrival\`, notes AS \`Notes\` FROM purchase_order     WHERE 
            order_id LIKE ? OR 
            order_date LIKE ? OR 
            Buyer LIKE ? OR 
            expected_arrival LIKE ? OR 
            notes LIKE ?`;
            queryParams = Array(5).fill(`%${searchTerm}%`);
          } else {
            query = `SELECT order_id AS \`Order\`, order_date AS \`Ordered\`, Buyer AS \`Ordered_By\`, expected_arrival AS \`Expected_Arrival\`, notes AS \`Notes\` FROM purchase_order`;
            queryParams = [];
          }
          break;

        case "batch":
          if (searchTerm !== "-1") {
            query = `
                SELECT 
                  b.batch_id AS Batch_ID, 
                  b.batch_name AS Batch_Name, 
                  u.name AS Created_By, 
                  b.received_date AS Received, 
                  b.received_goods_received_goods_id AS Receival_ID, 
                  b.si_number AS SI_Number 
                FROM 
                  batches b 
                INNER JOIN 
                  USERS u ON b.createdBy = u.userid 
                WHERE 
                  b.batch_name LIKE ? OR 
                  u.name LIKE ? OR 
                  b.received_date LIKE ? OR 
                  b.received_goods_received_goods_id LIKE ? OR 
                  b.si_number LIKE ?`;
            queryParams = Array(5).fill(`%${searchTerm}%`);
          } else {
            query = `
                SELECT 
                  b.batch_id AS Batch_ID, 
                  b.batch_name AS Batch_Name, 
                  u.name AS Created_By, 
                  b.received_date AS Received, 
                  b.received_goods_received_goods_id AS Receival_ID, 
                  b.si_number AS SI_Number 
                FROM 
                  batches b 
                INNER JOIN 
                  USERS u ON b.createdBy = u.userid`;
            queryParams = [];
          }
          break;

        case "receivedItems":
          if (searchTerm !== "-1") {
            query = `
                SELECT 
                  rgi.Name AS Name, 
                  rgi.Quantity AS Quantity, 
                  rgi.SI_number AS SI_Number, 
                  u.name AS Created_By, 
                  rgi.received_goods_id AS Receival_ID, 
                  rgi.received_item_id AS Received_Item_ID
                FROM 
                  received_goods_items rgi 
                INNER JOIN 
                  USERS u ON rgi.createdBy = u.userid 
                WHERE 
                  rgi.Name LIKE ? OR 
                  rgi.Quantity LIKE ? OR 
                  rgi.SI_number LIKE ? OR 
                  u.name LIKE ?`;
            queryParams = Array(4).fill(`%${searchTerm}%`);
          } else {
            query = `
                SELECT 
                  rgi.Name AS Name, 
                  rgi.Quantity AS Quantity, 
                  rgi.SI_number AS SI_Number, 
                  u.name AS Created_By, 
                  rgi.received_goods_id AS Receival_ID, 
                  rgi.received_item_id AS Received_Item_ID
                FROM 
                  received_goods_items rgi 
                INNER JOIN 
                  USERS u ON rgi.createdBy = u.userid`;
            queryParams = [];
          }
          break;

        case "material":
          if (searchTerm !== "-1") {
            query = `
                SELECT 
                  m.item_id AS ID, 
                  m.item_name AS Name, 
                  m.item_type AS Type
                FROM 
                  material m 
                WHERE 
                  m.item_name LIKE ? OR 
                  m.item_type LIKE ?`;
            queryParams = [`%${searchTerm}%`, `%${searchTerm}%`];
          } else {
            query = `
                SELECT 
                  m.item_id AS ID, 
                  m.item_name AS Name, 
                  m.item_type AS Type
                FROM 
                  material m`;
            queryParams = [];
          }
          break;

        case "poi":
          if (searchTerm !== "-1") {
            query = `
                SELECT 
                  poi.item_id AS ID, 
                  poi.Name AS Name, 
                  poi.Quantity AS Quantity,
                  poi.SI_number AS SI_Number,
                  poi.item_id AS Item_ID,
                  poi.item_type AS Type,
                  poi.order_id AS \`Order\`
                FROM 
                  purchase_order_items poi 
                WHERE 
                  poi.Name LIKE ? OR 
                  poi.SI_number LIKE ?`;
            queryParams = [`%${searchTerm}%`, `%${searchTerm}%`];
          } else {
            query = `
                SELECT 
                  poi.item_id AS ID, 
                  poi.Name AS Name, 
                  poi.Quantity AS Quantity,
                  poi.SI_number AS SI_Number,
                  poi.item_id AS Item_ID,
                  poi.item_type AS Type,
                  poi.order_id AS \`Order\`
                FROM 
                  purchase_order_items poi`;
            queryParams = [];
          }
          break;

        default:
          return res.status(400).json({ error: "Invalid category" });
      }

      const [results] = await pool.promise().query(query, queryParams);
      res.json(results);
    } catch (error) {
      console.error("Error during API call:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default SearchController;
