import { Router } from "express";
import pool from "../Services/dbService.js";

const SearchController = Router();

SearchController.get("/search/:searchTerm/:selectedCategory", async (req, res) => {
    try {
        var { searchTerm, selectedCategory } = req.params;


      let query, queryParams;  // Declare query and queryParams here
  
      switch (selectedCategory) {
        case "po":
          if (searchTerm !== "-1") {
            query = "SELECT * FROM purchase_order WHERE order_id LIKE ?";
            queryParams = [`%${searchTerm}%`];
          } else {
            query = "SELECT * FROM purchase_order";
            queryParams = [];
          }
          break;
        case "batch":
          if (searchTerm !== "-1") {
            query = "SELECT * FROM batches WHERE batch_name LIKE ?";
            queryParams = [`%${searchTerm}%`];
          } else {
            query = "SELECT * FROM batches";
            queryParams = [];
          }
          break;
        case "receivedItems":
          if (searchTerm !== "-1") {
            query = "SELECT * FROM received_goods_items WHERE Name LIKE ?";
            queryParams = [`%${searchTerm}%`];
          } else {
            query = "SELECT * FROM received_goods_items";
            queryParams = [];
          }
          break;
        case "material":
          if (searchTerm !== "-1") {
            query = "SELECT * FROM material WHERE item_name LIKE ?";
            queryParams = [`%${searchTerm}%`];
          } else {
            query = "SELECT * FROM material";
            queryParams = [];
          }
          break;
        case "poi":
          if (searchTerm !== "-1") {
            query = "SELECT * FROM purchase_order_items WHERE Name LIKE ?";
            queryParams = [`%${searchTerm}%`];
          } else {
            query = "SELECT * FROM purchase_order_items";
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
  });
  

export default SearchController;
