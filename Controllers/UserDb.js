import { Router } from "express";
import pool from "../Services/dbService.js";
import cors from "cors";
const UserDb = Router();
import axios from "axios";
import { verifyToken } from "../Services/AuthService.js";
import jwt from "jsonwebtoken";
UserDb.get("/usersFromEmail/:useremail", async (req, res) => {
  const { useremail } = req.params;

  try {
    const SELECT_USER_QUERY = `SELECT * FROM users WHERE email = ?`;
    const [results] = await pool
      .promise()
      .query(SELECT_USER_QUERY, [useremail]);

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = results[0]; // Assuming there's only one user for a given email

    // Generate a signed JWT token using the user's email

    console.log("MY SECRET", process.env.TOKEN_SECRET);
    const token = jwt.sign(
      {
        email: user.email,
      },
      process.env.TOKEN_SECRET,
      {
        expiresIn: "5hr",
      }
    );

    console.log(jwt.decode(token, { complete: true }), "YEEEEEEEEEEEEEEEEE");
    // Send the user information and the generated token in the response
    return res.status(200).json({ user, token });
  } catch (err) {
    console.error("Error fetching user:", err);
    return res.status(500).json({ error: "Error fetching user" });
  }
});

UserDb.get("/users/:userid", verifyToken, (req, res) => {
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

UserDb.patch("/users/:userid", verifyToken, (req, res) => {
  const { userid } = req.params;
  const { name, email, image } = req.body;

  const UPDATE_USER_QUERY = `UPDATE users SET name = ?, email = ?, image = ? WHERE userid = ?`;

  pool.query(
    UPDATE_USER_QUERY,
    [name, email, image, userid],
    (err, results) => {
      if (err) {
        console.error("Error updating user:", err);
        return res.status(500).json({ error: "Error updating user" });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log("User updated successfully");
      return res.status(200).json({ message: "User updated successfully" });
    }
  );
});

export default UserDb;
