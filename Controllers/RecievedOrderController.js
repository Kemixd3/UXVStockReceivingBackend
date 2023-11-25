import { Router } from "express";
import pool from "../Services/dbService.js";
import cors from "cors";

const ReceivedOrderController = Router();
//Endpoint to Post received-orders
ReceivedOrderController.post("/received-orders", async (req, res) => {
  try {
    const { received_date, product_order_id, Organization } = req.body;
    if (product_order_id != null) {
      const query = `INSERT INTO received_order (received_date, product_order_id, Organization) VALUES (?, ?, ?)`;

      await pool.query(query, [received_date, product_order_id, Organization]);

      res.status(201).json({ message: "Received order created successfully" });
    } else {
      res.status(400).json({ error: "product_order_id is NULL" });
    }
  } catch (error) {
    console.error("Error creating received order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Endpoint to handle GET requests for received orders using the product_order_id
ReceivedOrderController.get(
  "/received-orders/:product_order_id",
  async (req, res) => {
    try {
      const { product_order_id } = req.params;

      const query = "SELECT * FROM received_order WHERE product_order_id = ?";

      const receivedOrders = await pool.query(query, [product_order_id]);

      res.status(200).json({ receivedOrders });
    } catch (error) {
      console.error("Error fetching received orders:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default ReceivedOrderController;
