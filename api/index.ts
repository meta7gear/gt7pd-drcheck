require('dotenv').config(); // Load environment variables

const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;

// Get the session ID from the environment variable
const USER_SESSION_ID = process.env.USER_SESSION_ID;
if (!USER_SESSION_ID) {
  throw new Error("USER_SESSION_ID is not defined in the environment variables");
}

const USER_COOKIE = `JSESSIONID=${USER_SESSION_ID}`;

// Endpoint to handle GET requests
app.get("/", async (req, res) => {
  const userId = req.query.user_id;

  // Validate user_id parameter
  if (!userId) {
    return res.status(400).json({ error: "Missing user_id parameter" });
  }

  try {
    // Step 1: Get the access token
    const tokenResponse = await axios.get(
      "https://www.gran-turismo.com/au/gt7/info/api/token/",
      {
        headers: {
          Cookie: USER_COOKIE,
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      return res.status(500).json({ error: "Failed to retrieve access token" });
    }

    // Step 2: Fetch Driver Rating data
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const statsResponse = await axios.post(
      "https://web-api.gt7.game.gran-turismo.com/stats/get",
      {
        user_id: userId,
        year: currentYear,
        month: currentMonth,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:131.0) Gecko/20100101 Firefox/131.0",
        },
      }
    );

    const data = statsResponse.data.result.user;
    const drPointRatio = data.dr_point_ratio;
    const driverRating = data.driver_rating;
    const onlineID = data.np_online_id;
    const nickname = data.nick_name;
    

    // Calculate rating based on driver_rating
    let calculatedRating;
    switch (driverRating) {
      case 6:
        calculatedRating = 50000 + 49999 * drPointRatio;
        break;
      case 5:
        calculatedRating = 30000 + 19999 * drPointRatio;
        break;
      case 4:
        calculatedRating = 10000 + 19999 * drPointRatio;
        break;
      default:
        return res.status(400).json({ error: "Invalid driver rating value" });
    }

    // Send response
    return res.json({
      message: `Driver Rating for user ${onlineID} (${nickname}):`,
      dr: Math.round(calculatedRating),
    });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return res.status(500).json({
      error: "An error occurred while processing your request",
      details: error.message,
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
