import { Router } from "express";
import pool from "../Services/dbService.js";
import cors from "cors";
import { verifyToken } from "../Services/AuthService.js";
const stockDbController = Router();

stockDbController.get("/batches", verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    //Fetch paginated batches from database
    const [batches, fields] = await pool
      .promise()
      .query("SELECT * FROM Batches LIMIT ?, ?", [offset, parseInt(limit)]);

    res.status(200).json({ page, limit, batches });
  } catch (error) {
    console.error("Error retrieving batches:", error);
    res.status(500).json({ error: "Error retrieving batches" });
  }
});

stockDbController.post("/batches", verifyToken, async (req, res) => {
  try {
    const {
      batch_name,
      received_date,
      si_number,
      createdBy,
      received_goods_received_goods_id,
      items,
      formData,
    } = req.body;

    //Start transaction to prevent errors
    const connection = await pool.promise().getConnection();
    await connection.beginTransaction();

    try {
      const [batchResult] = await connection.query(
        "INSERT INTO Batches (batch_name, received_date, si_number, createdBy, received_goods_received_goods_id) VALUES (?, ?, ?, ?, ?)",
        [
          batch_name,
          received_date,
          si_number,
          createdBy,
          received_goods_received_goods_id,
        ]
      );

      //Insert items associated with batch

      await connection.commit(); //Commit transaction
      connection.release(); //Release the connection

      res.status(201).json({ message: "Batch created successfully" });
    } catch (error) {
      await connection.rollback(); //Rollback
      connection.release(); //Release

      console.error("Error creating batch:", error);
      res.status(500).json({ error: "Error creating batch" });
    }
  } catch (error) {
    console.error("Error creating batch:", error);
    res.status(500).json({ error: "Error creating batch" });
  }
});

stockDbController.get(
  "/batches/:receivedGoodsId/:si_number",
  verifyToken,
  (req, res) => {
    const receivedGoodsId = req.params.receivedGoodsId;
    const siNumber = req.params.si_number;

    //filter batches by both received_goods_received_goods_id and si_number
    pool.query(
      "SELECT * FROM batches WHERE received_goods_received_goods_id = ? AND si_number = ?",
      [receivedGoodsId, siNumber],
      (err, results) => {
        if (err) {
          console.error("Error fetching batches:", err);
          res.status(500).json({ error: "Error fetching batches" });
          return;
        }
        res.status(200).json(results);
      }
    );
  }
);

stockDbController.get("/allBatches", verifyToken, async (req, res) => {
  try {
    const sql = `
        SELECT b.batch_id, b.batch_name, b.received_date, b.si_number, t.type_name,
               i.item_id, i.item_name, i.quantity, i.received_date AS item_received_date
        FROM batches b
        JOIN itemtypes t ON b.type_id = t.type_id
        LEFT JOIN items i ON b.batch_id = i.batch_id
        ORDER BY b.batch_id, i.item_id;`;

    const [results] = await pool.promise().query(sql);

    // Group batches with their items
    const groupedBatches = results.reduce((acc, row) => {
      const { batch_id, batch_name, received_date, si_number, type_name } = row;
      const { item_id, item_name, quantity, item_received_date } = row;

      const batchIndex = acc.findIndex((batch) => batch.batch_id === batch_id);

      if (batchIndex === -1) {
        acc.push({
          batch_id,
          batch_name,
          received_date,
          si_number,
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

    //Send results
    res.status(200).json(groupedBatches);
  } catch (error) {
    console.error("Error fetching and organizing batches with items:", error);
    res
      .status(500)
      .json({ error: "Error fetching and organizing batches with items" });
  }
});

stockDbController.get("/batchAll", verifyToken, async (req, res) => {
  try {
    const sql = `
          SELECT *
          FROM batches;`;

    const [results] = await pool.promise().query(sql);

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching batches:", error);
    res.status(500).json({ error: "Error fetching batches" });
  }
});

export default stockDbController;
