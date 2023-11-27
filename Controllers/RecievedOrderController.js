import { Router } from "express";
import pool from "../Services/dbService.js";
import cors from "cors";

const ReceivedOrderController = Router();
//Endpoint to Post received-orders
ReceivedOrderController.post("/received-orders", async (req, res) => {
  try {
    const { received_date, purchase_order_id, Organization } = req.body;

    if (purchase_order_id) {
      //Check purchase_order_id exists in the purchase_order table
      const checkQuery = `SELECT * FROM received_order WHERE received_order_id = ?`;
      const [rows] = await pool
        .promise()
        .query(checkQuery, [purchase_order_id]);

      if (rows.length === 0) {
        console.log("works");
        //If purchase_order_id doesn't exist, proceed with insertion
        const insertQuery = `INSERT INTO received_order (received_date, purchase_order_id, Organization) VALUES (?, ?, ?)`;
        await pool
          .promise()
          .query(insertQuery, [received_date, purchase_order_id, Organization]);

        res
          .status(201)
          .json({ message: "Received order created successfully" });
      } else {
        //If purchase_order_id exists, return an error
        res.status(400).json({ error: "purchase order already exists" });
      }
    } else {
      res.status(400).json({ error: "purchase_order_id is NULL" });
    }
  } catch (error) {
    console.error("Error creating received order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Endpoint to handle GET requests for received orders using the purchase_order_id
ReceivedOrderController.get(
  "/received-orders/:purchase_order_id/:org?",
  async (req, res) => {
    try {
      let { purchase_order_id, org } = req.params;

      org = org || "DK";

      //Check if received_order already exists for the provided organization
      const query =
        "SELECT * FROM received_order WHERE purchase_order_id = ? AND Organization = ?";
      const [receivedOrdersRows] = await pool
        .promise()
        .query(query, [purchase_order_id, org]);

      if (receivedOrdersRows.length > 0) {
        res.status(200).json({ receivedOrders: receivedOrdersRows });
      } else {
        res.status(404).json({
          message:
            "No received orders found for this purchase order ID and organization",
        });
      }
    } catch (error) {
      console.error("Error fetching received orders:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default ReceivedOrderController;
