import { Router } from "express";
import pool from "../Services/dbService.js";
import cors from "cors";
const UserDb = Router();
import { verifyToken } from "../Services/AuthService.js";
import jwt from "jsonwebtoken";
UserDb.get("/usersFromEmail/:useremail", async (req, res) => {
  const { useremail } = req.params;

  try {
    //Fetch user data based on the email from the database
    const SELECT_USER_QUERY = `SELECT * FROM users WHERE email = ?`;
    const [userResults] = await pool
      .promise()
      .query(SELECT_USER_QUERY, [useremail]);
    const user = userResults.length ? userResults[0] : null;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = req.headers.authorization?.split(" ")[1]; //Get token from Authorization header

    if (!token) {
      return res.status(401).json({ message: "Token not found" });
    }

    //Verify the token to check if it's valid or expired
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        //Token is invalid or expired, generate a new token for the user
        const newToken = jwt.sign(
          {
            email: useremail,
          },
          process.env.TOKEN_SECRET,
          {
            expiresIn: "5hr",
          }
        );

        return res
          .status(200)
          .json({ message: "New token generated", user, token: newToken });
      } else {
        //Token valid
        return res.status(200).json({ message: "Token is valid", user });
      }
    });
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
