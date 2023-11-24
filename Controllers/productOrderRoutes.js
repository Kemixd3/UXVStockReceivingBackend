import { Router } from "express";
import pool from "../Services/dbService.js";
import cors from "cors";

const productOrderRoutes = Router();
//const ProductOrder = require("../models/ProductOrder");
productOrderRoutes.get("/product-orders", async (req, res) => {
  const { page = 1, limit = 10, org } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = "SELECT * FROM Product_order";
    const queryParams = [];

    if (org && (org === "DK" || org === "US")) {
      query += " WHERE organization = ?";
      queryParams.push(org);
    }

    query += " LIMIT ?, ?";
    queryParams.push(offset, parseInt(limit));

    const [results] = await pool.promise().query(query, queryParams);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

productOrderRoutes.get("/product-order-items/:orderId", (req, res) => {
  const orderId = req.params.orderId;

  const sql = `SELECT * FROM product_order_items WHERE order_id = ?`;

  pool.query(sql, [orderId], (err, results) => {
    if (err) {
      console.error("Error executing MySQL query:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    res.status(200).json({ productOrderItems: results });
  });
});

productOrderRoutes.post("/product-order-items", (req, res) => {
  const { orderId, items } = req.body; // Assuming the request body contains orderId and items array

  if (!orderId || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const insertQueries = items.map((item) => {
    return [
      item.Name,
      item.Quantity,
      item.SI_number,
      orderId, // Link the product order ID to each item
    ];
  });

  const sql = `INSERT INTO product_order_items (Name, Quantity, SI_number, order_id) VALUES ?`;

  pool.query(sql, [insertQueries], (err, results) => {
    if (err) {
      console.error("Error executing MySQL query:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    res.status(201).json({ message: "Product order items added successfully" });
  });
});

export default productOrderRoutes;
