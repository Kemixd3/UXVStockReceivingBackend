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

ReceivedGoodsController.post("/received_goods_items", async (req, res) => {
  try {
    // Extract data from the request body
    const { received_goods_id, name, quantity, si_number } = req.body;

    // Assuming you have a database connection, you can save the data to the database
    const query = `INSERT INTO received_goods_items (received_goods_id, Name, Quantity, SI_number, is_batch) VALUES (?, ?, ?, ?, ?)`;

    // Use the connection pool to execute the query
    await pool
      .promise()
      .execute(query, [received_goods_id, name, quantity, si_number, "1"]);

    // Send a success response
    res
      .status(200)
      .json({ message: "Received goods item posted successfully" });
  } catch (error) {
    // Handle any errors that occur during processing
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

ReceivedGoodsController.get(
  "/received_goods_items/:received_goods_id/:si_number",
  async (req, res) => {
    try {
      // Extract data from the request query parameters
      const { received_goods_id, si_number } = req.query;

      // Validate the presence of required parameters
      if (!received_goods_id || !si_number) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      // Fetch items from the received_goods_items table
      const query =
        "SELECT * FROM received_goods_items WHERE received_goods_id = ? AND si_number = ?";
      const [itemsRows] = await pool
        .promise()
        .query(query, [received_goods_id, si_number]);

      // Check if items were found
      if (itemsRows.length > 0) {
        res.status(200).json({ receivedGoodsItems: itemsRows });
      } else {
        res.status(404).json({
          message: "No received goods items found for the provided parameters",
        });
      }
    } catch (error) {
      console.error("Error fetching received goods items:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

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

// GET all batches with their associated received goods items
ReceivedGoodsController.get(
  "/batches-with-received-goods",
  async (req, res) => {
    try {
      const sql = `
      SELECT b.*, rgi.*
      FROM batches b
      JOIN batches_has_received_goods_items bhrgi ON b.batch_id = bhrgi.batches_batch_id
      JOIN received_goods_items rgi ON bhrgi.received_goods_items_received_item_id = rgi.received_item_id
      ORDER BY b.batch_id, rgi.received_item_id;
    `;

      const [results] = await pool.promise().query(sql);

      // Group batches with their received goods items
      const groupedBatches = results.reduce((acc, row) => {
        const {
          batch_id,
          batch_name,
          received_date,
          si_number,
          createdBy,
          received_goods_received_goods_id,
          received_item_id,
          Name,
          Quantity,
          SI_number,
          is_batch,
        } = row;

        const batchIndex = acc.findIndex(
          (batch) => batch.batch_id === batch_id
        );

        if (batchIndex === -1) {
          acc.push({
            batch_id,
            batch_name,
            received_date,
            si_number,
            createdBy,
            received_goods_received_goods_id,
            received_goods_items: [
              {
                received_item_id,
                Name,
                Quantity,
                SI_number,
                is_batch,
              },
            ],
          });
        } else {
          acc[batchIndex].received_goods_items.push({
            received_item_id,
            Name,
            Quantity,
            SI_number,
            is_batch,
          });
        }
        return acc;
      }, []);

      // Send the grouped results
      res.status(200).json(groupedBatches);
    } catch (error) {
      console.error("Error fetching batches with received goods items:", error);
      res
        .status(500)
        .json({ error: "Error fetching batches with received goods items" });
    }
  }
);

export default ReceivedGoodsController;
