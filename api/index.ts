require('dotenv').config(); // Load environment variables

const express = require("express");
const cors = require("cors");
const { getToken, getStats } = require("./provider");
const calculateRating = require("../helpers/calculateRating");
const path = require('path');

const app = express();
const PORT = 3000;


app.use(cors());


// Get the session ID from the environment variable
const USER_SESSION_ID = process.env.USER_SESSION_ID;
if (!USER_SESSION_ID) {
  throw new Error("USER_SESSION_ID is not defined in the environment variables");
}

const USER_COOKIE = `JSESSIONID=${USER_SESSION_ID}`;

// Endpoint to handle GET requests
app.get("/json", async (req, res) => {
  const userId = req.query.user_id;

  // Validate user_id parameter
  if (!userId) {
    return res.status(400).json({ error: "Missing user_id parameter" });
  }

  try {
    const accessToken = await getToken(USER_COOKIE);
    const stats = await getStats(userId, accessToken);

    const { drPointRatio, driverRating, onlineID, nickname } = stats;
    const calculatedRating = calculateRating(driverRating, drPointRatio);

    return res.json({
      message: `Driver Rating for user ${onlineID} (${nickname}):`,
      psn: onlineID,
      driver_name: nickname,
      dr: Math.round(calculatedRating.rating),
      rank: calculatedRating.rank,
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: "An error occurred", details: error.message });
  }
});

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname, '..', 'components', 'index.html'));
});

app.get('/obs', function (req, res) {
	res.sendFile(path.join(__dirname, '..', 'components', 'obs.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
