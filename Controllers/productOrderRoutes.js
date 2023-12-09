import { Router } from "express";
import pool from "../Services/dbService.js";
import cors from "cors";
import { verifyToken } from "../Services/AuthService.js";

const PurchaseOrderRoutes = Router();
//const purchaseOrder = require("../models/purchaseOrder");
PurchaseOrderRoutes.get("/purchase-orders", verifyToken, async (req, res) => {
  const { page = 1, limit = 10, org } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = "SELECT * FROM Purchase_order";
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

PurchaseOrderRoutes.get(
  "/purchase-order-items/:orderId",
  verifyToken,
  (req, res) => {
    const orderId = req.params.orderId;

    const sql = `SELECT * FROM purchase_order_items WHERE order_id = ?`;

    pool.query(sql, [orderId], (err, results) => {
      if (err) {
        console.error("Error executing MySQL query:", err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }

      res.status(200).json({ purchaseOrderItems: results });
    });
  }
);

//Skal slettes
PurchaseOrderRoutes.post("/purchase-order-items", verifyToken, (req, res) => {
  const { orderId, items } = req.body; // Assuming the request body contains orderId and items array

  if (!orderId || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const insertQueries = items.map((item) => {
    return [
      item.Name,
      item.Quantity,
      item.SI_number,
      item.type_id,
      orderId, // Link the purchase order ID to each item
    ];
  });

  const sql = `INSERT INTO purchase_order_items (Name, Quantity, SI_number, order_id) VALUES ?`;

  pool.query(sql, [insertQueries], (err, results) => {
    if (err) {
      console.error("Error executing MySQL query:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    res
      .status(201)
      .json({ message: "Purchase order items added successfully" });
  });
});

export default PurchaseOrderRoutes;
