import express from "express";
import pool from "./Services/dbService.js";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import UserDb from "./Controllers/UserDb.js";
import stockDbController from "./Controllers/StockDbController.js";
import productOrderRoutes from "./Controllers/productOrderRoutes.js";
import ReceivedOrderController from "./Controllers/RecievedOrderController.js";
//require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("", stockDbController);
app.use("/users", UserDb);
app.use("/orders", productOrderRoutes);
app.use("/receiving", ReceivedOrderController);

const port = process.env.PORT || 3001;

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error getting MySQL connection:", err);
    return;
  }

  connection.release(); // Return the connection to the pool when done.
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get("/allStockItems", async (req, res) => {
  try {
    const { query } = req.query;
    const searchQuery = `%${query}%`;

    // SQL query to search across all entities (tracks, artists, and albums)
    const sql = `
      SELECT 'track' as entity_type, track_id as id, track_title as name, duration
      FROM Tracks
    `;

    const [results] = await pool.query(sql, [
      searchQuery,
      searchQuery,
      searchQuery,
    ]);

    // Process and structure the search results as needed
    res.status(200).json(results);
  } catch (err) {
    console.error("Error performing global search:", err);
    res.status(500).json({ error: "Error performing global search" });
  }
});
