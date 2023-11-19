import { Router } from "express";
import pool from "../Services/dbService.js";
import cors from "cors";
const UserDb = Router();

UserDb.post("/post", (req, res) => {
  const { userid, name, email, image } = req.body;
  const INSERT_USER_QUERY = `INSERT INTO users (userid, name, email, image) VALUES (?, ?, ?, ?)`;

  pool.query(
    INSERT_USER_QUERY,
    [userid, name, email, image],
    (err, results) => {
      if (err) {
        console.error("Error creating user:", err);
        return res.status(500).json({ error: "Error creating user" });
      }

      console.log("User created successfully");
      return res.status(201).json({ message: "User created successfully" });
    }
  );
});

export default UserDb;
