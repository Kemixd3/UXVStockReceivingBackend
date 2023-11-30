import { Router } from "express";
import pool from "../Services/dbService.js";
import cors from "cors";

const ReceivedGoodsController = Router();
//Endpoint to Post received-goods
ReceivedGoodsController.post("/received-goods", async (req, res) => {
  try {
    const { received_date, purchase_order_id, Organization } = req.body;

    if (purchase_order_id) {
      //Check purchase_order_id exists in the purchase_order table
      const checkQuery = `SELECT * FROM received_goods WHERE received_order_id = ?`;
      const [rows] = await pool
        .promise()
        .query(checkQuery, [purchase_order_id]);

      if (rows.length === 0) {
        console.log("works");
        //If purchase_order_id doesn't exist, proceed with insertion
        const insertQuery = `INSERT INTO received_goods (received_date, purchase_order_id, Organization) VALUES (?, ?, ?)`;
        await pool
          .promise()
          .query(insertQuery, [received_date, purchase_order_id, Organization]);

        res
          .status(201)
          .json({ message: "Received goods created successfully" });
      } else {
        //If purchase_order_id exists, return an error
        res.status(400).json({ error: "purchase order already exists" });
      }
    } else {
      res.status(400).json({ error: "purchase_order_id is NULL" });
    }
  } catch (error) {
    console.error("Error creating received goods:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Endpoint to handle GET requests for received goods using the purchase_order_id
ReceivedGoodsController.get(
  "/received-goods/:purchase_order_id/:org?",
  async (req, res) => {
    try {
      let { purchase_order_id, org } = req.params;

      org = org || "DK";

      //Check if received_goods already exists for the provided organization
      const query =
        "SELECT * FROM received_goods WHERE purchase_order_id = ? AND Organization = ?";
      const [receivedGoodsRows] = await pool
        .promise()
        .query(query, [purchase_order_id, org]);

      if (receivedGoodsRows.length > 0) {
        res.status(200).json({ receivedGoods: receivedGoodsRows });
      } else {
        res.status(404).json({
          message:
            "No received goods found for this purchase order ID and organization",
        });
      }
    } catch (error) {
      console.error("Error fetching received goods:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default ReceivedGoodsController;
