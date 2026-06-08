// server/index.js
// Only responsible for starting the server.
// The actual Express app lives in app.js so tests can import it cleanly.

const app = require("./app");
const { seedIfEmpty } = require("./data/seed");

const PORT = process.env.PORT || 5000;

// Seed sample tasks on first run so reviewers see something immediately
seedIfEmpty();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
