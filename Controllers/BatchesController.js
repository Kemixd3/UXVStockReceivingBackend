import { Router } from "express";
import pool from "../Services/dbService.js";
import cors from "cors";
import { verifyToken } from "../Services/AuthService.js";

const BatchesController = Router();

BatchesController.delete(
  "/batches/:batch_id",
  verifyToken,
  async (req, res) => {
    try {
      // Extract batch_id from the request parameters
      const { batch_id } = req.params;

      // Validate the presence of required parameter
      if (!batch_id) {
        return res.status(400).json({ error: "Missing batch_id parameter" });
      }

      // Begin a transaction to ensure atomicity
      const connection = await pool.promise().getConnection();
      await connection.beginTransaction();

      try {
        // Fetch received_item_ids associated with the batch_id
        const fetchReceivedItemIdsQuery =
          "SELECT received_goods_items_received_item_id FROM batches_has_received_goods_items WHERE batches_batch_id = ?";
        const [receivedItemIds] = await connection.query(
          fetchReceivedItemIdsQuery,
          [batch_id]
        );

        // Delete entries from batches_has_received_goods_items
        const deleteFromJoinTableQuery =
          "DELETE FROM batches_has_received_goods_items WHERE batches_batch_id = ?";
        await connection.query(deleteFromJoinTableQuery, [batch_id]);

        // Delete received_goods_items entries associated with the batch_id
        const receivedItemIdsArray = receivedItemIds.map(
          ({ received_goods_items_received_item_id }) =>
            received_goods_items_received_item_id
        );
        if (receivedItemIdsArray.length > 0) {
          const deleteReceivedItemsQuery =
            "DELETE FROM received_goods_items WHERE received_item_id IN (?)";
          await connection.query(deleteReceivedItemsQuery, [
            receivedItemIdsArray,
          ]);
        }

        // Delete batch entry
        const deleteBatchQuery = "DELETE FROM batches WHERE batch_id = ?";
        const [deleteResult] = await connection.query(deleteBatchQuery, [
          batch_id,
        ]);

        // Check if the delete operation was successful
        if (deleteResult.affectedRows > 0) {
          // Commit the transaction
          await connection.commit();
          res.status(200).json({
            message: "Batch and associated items deleted successfully",
          });
        } else {
          throw new Error("Batch not found");
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
      console.error("Error deleting batch and associated items:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
// Change the server route to accept batch data as query parameters
BatchesController.put(
  "/batches/:batch_id",
  verifyToken,
  async (req, res) => {
    try {
      const { batch_id } = req.params;
      const {
        BatchName,
        CreatedBy,
        ReceivedGoodsID,
        SI_Date,
        SINumber,
      } = req.body;

      if (!batch_id) {
        return res.status(400).json({ error: "Missing batch_id parameter" });
      }

      const connection = await pool.promise().getConnection();
      await connection.beginTransaction();

      try {
        // Use the current date as the received date
        const receivedDate = new Date().toISOString().slice(0, 19).replace("T", " ");

        const updateBatchQuery =
          "UPDATE batches " +
          "SET batch_name = ?, createdBy = ?, received_goods_received_goods_id = ?, received_date = ?, si_number = ? " +
          "WHERE batch_id = ?";
        const [updateBatchResult] = await connection.query(updateBatchQuery, [
          BatchName,
          CreatedBy,
          ReceivedGoodsID,
          receivedDate, // Use the received date here
          SINumber,
          batch_id,
        ]);

        if (updateBatchResult.affectedRows > 0) {
          await connection.commit();
          res.status(200).json({ message: "Batch updated successfully" });
        } else {
          throw new Error("Batch not found");
        }
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error("Error updating batch:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);



export default BatchesController;
