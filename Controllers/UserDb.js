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

UserDb.get("/users/:userid", (req, res) => {
  const { userid } = req.params;

  const SELECT_USER_QUERY = `SELECT * FROM users WHERE userid = ?`;

  pool.query(SELECT_USER_QUERY, [userid], (err, results) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).json({ error: "Error fetching user" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = results[0]; // Assuming there's only one user for a given userid
    return res.status(200).json({ user });
  });
});

export default UserDb;
