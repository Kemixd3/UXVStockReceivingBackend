import { Router } from "express";
import pool from "../Services/dbService.js";
import cors from "cors";
import getQuantity from "../Services/QuantityVal.js";

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

ReceivedGoodsController.get(
  "/received_goods_items/:batch_id/:si_number",
  async (req, res) => {
    try {
      const { batch_id, si_number } = req.params;
      console.log(batch_id, si_number);
      //Validate parameters
      if (!batch_id || !si_number) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      //Fetch from the received_goods_items table joined with batches table
      const query =
        "SELECT received_goods_items.* FROM received_goods_items " +
        "INNER JOIN batches_has_received_goods_items ON " +
        "received_goods_items.received_item_id = batches_has_received_goods_items.received_goods_items_received_item_id " +
        "INNER JOIN batches ON " +
        "batches.batch_id = batches_has_received_goods_items.batches_batch_id " +
        "WHERE batches.batch_id = ? AND received_goods_items.SI_number = ?";

      const [itemsRows] = await pool
        .promise()
        .query(query, [batch_id, si_number]);

      //Check if items found
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

ReceivedGoodsController.post("/received_goods_items", async (req, res) => {
  try {
    // Extract data from the request body
    const { batch_id, receivedGoodsItems } = req.body;

    // Validate the presence of required parameters
    if (
      !batch_id ||
      !receivedGoodsItems ||
      !Array.isArray(receivedGoodsItems)
    ) {
      return res.status(400).json({ error: "Missing or invalid parameters" });
    }

    // Get a connection from the pool
    const connection = await pool.promise().getConnection();

    try {
      // Begin a transaction
      await connection.beginTransaction();

      for (const item of receivedGoodsItems) {
        const { Name, Quantity, SI_number, createdBy, received_goods_id } =
          item;

        // Insert item into received_goods_items table
        const insertItemQuery =
          "INSERT INTO received_goods_items (Name, Quantity, SI_number, createdBy, received_goods_id) VALUES (?, ?, ?, ?, ?)";
        const [insertItemResult] = await connection.query(insertItemQuery, [
          Name,
          Quantity,
          SI_number,
          createdBy,
          received_goods_id,
        ]);

        const receivedItemId = insertItemResult.insertId;

        // Insert into join table batches_has_received_goods_items
        const insertIntoJoinTableQuery =
          "INSERT INTO batches_has_received_goods_items (batches_batch_id, received_goods_items_received_item_id) VALUES (?, ?)";
        await connection.query(insertIntoJoinTableQuery, [
          batch_id,
          receivedItemId,
        ]);
      }

      // Commit the transaction
      await connection.commit();

      res.status(201).json({
        message: "Received goods items added to the batch successfully",
      });
    } catch (error) {
      // Rollback transaction in case of an error
      await connection.rollback();
      throw error;
    } finally {
      // Release the connection back to the pool
      connection.release();
    }
  } catch (error) {
    console.error("Error adding received goods items:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

ReceivedGoodsController.put(
  "/received_goods_items/:received_item_id",
  async (req, res) => {
    try {
      const receivedItemId = req.params.received_item_id;
      const {
        Name,
        Quantity,
        SI_number,
        createdBy,
        QuantityPO,
        received_goods_id,
        received_item_id,
      } = req.body;

      const CheckQuantity = await getQuantity(
        received_goods_id,
        SI_number,
        Quantity,
        received_item_id
      );
      if (CheckQuantity.isAboveOrderQuantity == false) {
        // Validate the presence of required parameters
        if (!Name || !Quantity || !SI_number || !createdBy) {
          return res
            .status(400)
            .json({ error: "Missing or invalid parameters" });
        }

        // Get a connection from the pool
        const connection = await pool.promise().getConnection();

        try {
          // Begin a transaction
          await connection.beginTransaction();

          // Update item in received_goods_items table
          const updateItemQuery =
            "UPDATE received_goods_items SET Name = ?, Quantity = ?, SI_number = ?, createdBy = ? WHERE received_item_id = ?";
          await connection.query(updateItemQuery, [
            Name,
            Quantity,
            SI_number,
            createdBy,
            receivedItemId,
          ]);

          // Commit the transaction
          await connection.commit();

          res
            .status(200)
            .json({ message: "Received goods item updated successfully" });
        } catch (error) {
          // Rollback transaction in case of an error
          await connection.rollback();
          throw error;
        } finally {
          // Release the connection back to the pool
          connection.release();
        }
      } else {
        console.log(CheckQuantity);
        res.status(500).json({
          error: "Limit reached, Total: " + CheckQuantity.totalQuantity,
        });
      }
    } catch (error) {
      console.error("Error updating received goods item:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

ReceivedGoodsController.delete(
  "/received_goods_items/:received_item_id",
  async (req, res) => {
    try {
      // Extract received_item_id from the request parameters
      const { received_item_id } = req.params;

      // Validate the presence of required parameter
      if (!received_item_id) {
        return res
          .status(400)
          .json({ error: "Missing received_item_id parameter" });
      }

      // Begin a transaction to ensure atomicity
      const connection = await pool.promise().getConnection();
      await connection.beginTransaction();

      try {
        // Delete entry from batches_has_received_goods_items
        const deleteFromJoinTableQuery =
          "DELETE FROM batches_has_received_goods_items WHERE received_goods_items_received_item_id = ?";
        await connection.query(deleteFromJoinTableQuery, [received_item_id]);

        // Delete received_goods_items entry
        const deleteItemQuery =
          "DELETE FROM received_goods_items WHERE received_item_id = ?";
        const [deleteResult] = await connection.query(deleteItemQuery, [
          received_item_id,
        ]);

        // Check if the delete operation was successful
        if (deleteResult.affectedRows > 0) {
          // Commit the transaction
          await connection.commit();
          res
            .status(200)
            .json({ message: "Received goods item deleted successfully" });
        } else {
          throw new Error("Received goods item not found");
        }
      } catch (error) {
        // Rollback transaction in case of an error
        await connection.rollback();
        throw error;
      } finally {
        // Release the connection back to the pool
        connection.release();
      }
    } catch (error) {
      console.error("Error deleting received goods item:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default ReceivedGoodsController;
