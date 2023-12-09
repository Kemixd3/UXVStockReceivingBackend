import express from "express";
import pool from "./Services/dbService.js";
import cors from "cors";
import bodyParser from "body-parser";
import UserDbController from "./Controllers/UserDbController.js";
import stockDbController from "./Controllers/StockDbController.js";
import PurchaseOrderRoutes from "./Controllers/productOrderRoutes.js";
import ReceivedGoodsController from "./Controllers/RecievedGoodsController.js";
import BatchesController from "./Controllers/BatchesController.js";
import SearchController from "./Controllers/searchController.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("", stockDbController);
app.use("/users", UserDbController);
app.use("/orders", PurchaseOrderRoutes);
app.use("/receiving", ReceivedGoodsController);
app.use("/batches", BatchesController);
app.use("/search", SearchController);

const port = process.env.PORT || 3001;

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error getting MySQL connection:", err);
    return;
  }

  connection.release(); //Release connection to the pool when done.
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
