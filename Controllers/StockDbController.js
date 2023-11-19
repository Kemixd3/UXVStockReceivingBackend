import { Router } from "express";
import pool from "../Services/dbService.js";
import cors from "cors";
const stockDbController = Router();

stockDbController.get("/batches", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Fetch paginated batches from the database
    const [batches, fields] = await pool
      .promise()
      .query("SELECT * FROM Batches LIMIT ?, ?", [offset, parseInt(limit)]);

    res.status(200).json({ page, limit, batches });
  } catch (error) {
    console.error("Error retrieving batches:", error);
    res.status(500).json({ error: "Error retrieving batches" });
  }
});

stockDbController.post("/batches", async (req, res) => {
  try {
    const { batch_name, received_date, si_id, items } = req.body;
    const type_id = req.body.type_id; // Assuming type_id is provided

    // Start a transaction to ensure data consistency
    const connection = await pool.promise().getConnection();
    await connection.beginTransaction();

    try {
      // Insert the batch details
      const [batchResult] = await connection.query(
        "INSERT INTO Batches (batch_name, received_date, si_id, type_id) VALUES (?, ?, ?, ?)",
        [batch_name, received_date, si_id, type_id]
      );

      const batchId = batchResult.insertId;

      // Insert items associated with the batch
      for (const item of items) {
        const { item_name, quantity, received_date } = item;
        await connection.query(
          "INSERT INTO Items (item_name, quantity, received_date, batch_id) VALUES (?, ?, ?, ?)",
          [item_name, quantity, received_date, batchId]
        );
      }

      await connection.commit(); // Commit the transaction
      connection.release(); // Release the connection

      res.status(201).json({ message: "Batch created successfully" });
    } catch (error) {
      await connection.rollback(); // Rollback in case of any errors
      connection.release(); // Release the connection

      console.error("Error creating batch:", error);
      res.status(500).json({ error: "Error creating batch" });
    }
  } catch (error) {
    console.error("Error creating batch:", error);
    res.status(500).json({ error: "Error creating batch" });
  }
});

// GET all batches with their item types and items
stockDbController.get("/allBatches", async (req, res) => {
  try {
    const sql = `
        SELECT b.batch_id, b.batch_name, b.received_date, b.si_id, t.type_name,
               i.item_id, i.item_name, i.quantity, i.received_date AS item_received_date
        FROM batches b
        JOIN itemtypes t ON b.type_id = t.type_id
        LEFT JOIN items i ON b.batch_id = i.batch_id
        ORDER BY b.batch_id, i.item_id;`;

    const [results] = await pool.promise().query(sql);

    // Group batches with their items
    const groupedBatches = results.reduce((acc, row) => {
      const { batch_id, batch_name, received_date, si_id, type_name } = row;
      const { item_id, item_name, quantity, item_received_date } = row;

      const batchIndex = acc.findIndex((batch) => batch.batch_id === batch_id);

      if (batchIndex === -1) {
        acc.push({
          batch_id,
          batch_name,
          received_date,
          si_id,
          type_name,
          items: item_id
            ? [{ item_id, item_name, quantity, item_received_date }]
            : [],
        });
      } else {
        acc[batchIndex].items.push({
          item_id,
          item_name,
          quantity,
          item_received_date,
        });
      }
      return acc;
    }, []);

    // Send the grouped results
    res.status(200).json(groupedBatches);
  } catch (error) {
    console.error("Error fetching and organizing batches with items:", error);
    res
      .status(500)
      .json({ error: "Error fetching and organizing batches with items" });
  }
});

export default stockDbController;
