// server/app.js
// The Express app is defined here, separate from index.js.
//
// Why the split? When tests import the app, we don't want the server
// to actually start listening on a port. Keeping app.js (the Express
// instance) and index.js (the server start) separate is a standard
// Node.js pattern for testable APIs.

const express = require("express");
const cors = require("cors");
const taskRoutes = require("./routes/tasks");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://task-manager-p06g.onrender.com"
  ]
}));
app.use(express.json());
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Task Manager API is running!" });
});

module.exports = app;
