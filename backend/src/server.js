// Imports.
import express from "express";
import dotenv from "dotenv";
dotenv.config();

// App.
const app = express();

// Routes.
app.get("/", (req, res) => { res.status(200).json({ message: "Server health is good. 🔋" });})

// Server.
app.listen(3000, () => console.log("Server is running on port 3000 🍭🌟🚀"))