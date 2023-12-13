import axios from "axios";
import pool from "../Services/dbService.js"; // Assuming this imports your database connection
import jwt from "jsonwebtoken";
import "dotenv/config";

async function verifyToken(req, res, next) {
  try {
    const bearerToken = req.headers.authorization;

    if (!bearerToken || typeof bearerToken !== "string") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = bearerToken.split(" ")[1];

    if (!token || token === "Bearer null") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        console.log("Error in token verification:", err);
        return res.status(403).json({ message: "Forbidden" });
      }

      //check the user against the database
      const SELECT_USER_QUERY = "SELECT * FROM users WHERE email = ?";
      pool.query(SELECT_USER_QUERY, [decoded.email], (err, results) => {
        if (err) {
          console.error("Error querying database:", err);
          return res.status(500).json({ message: "Internal Server Error" });
        }

        //only one user for a given email
        const allowedUser = results && results.length > 0 ? results[0] : null;

        if (!allowedUser || allowedUser.email !== decoded.email) {
          console.log("Unauthorized user");
          return res.status(403).json({ message: "Forbidden" });
        }

        req.user = decoded;
        next(); // Proceed to the next middleware
      });
    });
  } catch (error) {
    console.error("Error in verifyToken:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export { verifyToken };
