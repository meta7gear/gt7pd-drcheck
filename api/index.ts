require('dotenv').config(); // Load environment variables

const express = require("express");
const cors = require("cors");
const { getToken, getStats, getUser, getRoundLapTimes } = require("./provider");
const { loginUser, registerUser } = require("./authProvider");
const { addUser, getUserByPsn, retrieveDailyStats, saveDailyStats, updateUserStatsHistory } = require("./psnProvider");
const calculateRating = require("../helpers/calculateRating");
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// CORS configuration
const corsOptions = {
  origin: "https://gt7pd-drcheck.vercel.app",
  methods: ["POST"],
  optionsSuccessStatus: 200, // For legacy browser support
};
app.use(express.json()); // This line is crucial
app.use(cors());

app.use(express.static(path.join(__dirname, '..', 'public')));

// Get the session ID from the environment variable
const USER_SESSION_ID = process.env.USER_SESSION_ID;
if (!USER_SESSION_ID) {
  throw new Error("USER_SESSION_ID is not defined in the environment variables");
}

const USER_COOKIE = `JSESSIONID=${USER_SESSION_ID}`;

// Register User
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  try {
    const userRecord = await registerUser(email, password);
    res.status(201).json({ uid: userRecord.uid, email: userRecord.email });
  } catch (error) {
    console.error('Error creating new user:', error);
    res.status(400).json({ error: error.message });
  }
});

// Login User
app.post('/login', async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  try {
    const user = await loginUser(token);
    res.status(200).json({ uid: user.uid, email: user.email });
  } catch (error) {
    console.error('Error creating new user:', error);
    res.status(400).json({ error: error.message });
  }
});

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
    const calculatedRating = calculateRating(stats.driverRating, stats.drPointRatio);

    const params = {
      psn: stats.onlineID,
      driver_name: stats.nickname,
      dr: Math.round(calculatedRating.rating),
      drPointRatio: stats.drPointRatio,
      rank: calculatedRating.rank,
      sr: stats.sportsmanshipRating,
      userID: stats.userID,
      manufacturerID: stats.manufacturerID,
      countryCode: stats.countryCode,
      raceCount: stats.raceCount,
      polePositionCount: stats.polePositionCount,
      fastestLapCount: stats.fastestLapCount,
      winCount: stats.winCount,
    };

    saveDailyStats(params);
    updateUserStatsHistory(params);

    return res.json({
      message: `Driver Rating for user ${stats.onlineID} (${stats.nickname}):`,
      ...params,
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: "Unable to connect to the Gran Turismo api, please try again later.", details: error.message });
  }
});

app.get("/getUserByUrl", async (req, res) => {
  const userUrl = req.query.user_url;

  // Validate user_url parameter
  if (!userUrl) {
    return res.status(400).json({ error: "Missing user_url parameter" });
  }

  try {
    const accessToken = await getToken(USER_COOKIE);
    const user = await getUser(userUrl, accessToken);
    const { onlineID, nickname, user_id } = user;

    return res.json({
      psn: onlineID,
      driver_name: nickname,
      user_id: user_id,
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: "An error occurred", details: error.message });
  }
});

app.get("/getRoundLapTimes", async (req, res) => {
  const eventId = req.query.event_id;

  // Validate even_id parameter
  if (!eventId) {
    return res.status(400).json({ error: "Missing event_id parameter" });
  }

  try {
    const accessToken = await getToken(USER_COOKIE);
    const eventLapTimes = await getRoundLapTimes(eventId, accessToken);

    return res.json(eventLapTimes);
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: "An error occurred", details: error.message });
  }
});

app.get("/getJsonByPsn", async (req, res) => {
  const userPsn = req.query.psn;

  if (!userPsn) {
    return res.status(400).json({ error: "Missing psn parameter" });
  }

  try {
    const user = await getUserByPsn(userPsn);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const accessToken = await getToken(USER_COOKIE);
    const stats = await getStats(user.user_id, accessToken);
    const calculatedRating = calculateRating(stats.driverRating, stats.drPointRatio);

    const params = {
      psn: stats.onlineID,
      driver_name: stats.nickname,
      dr: Math.round(calculatedRating.rating),
      drPointRatio: stats.drPointRatio,
      rank: calculatedRating.rank,
      sr: stats.sportsmanshipRating,
      userID: stats.userID,
      manufacturerID: stats.manufacturerID,
      countryCode: stats.countryCode,
      raceCount: stats.raceCount,
      polePositionCount: stats.polePositionCount,
      fastestLapCount: stats.fastestLapCount,
      winCount: stats.winCount,
    };

    saveDailyStats(params);
    updateUserStatsHistory(params);

    return res.json({
      message: `Driver Rating for user ${stats.onlineID} (${stats.nickname}):`,
      ...params,
    });

  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: "An error occurred", details: error.message });
  }
});

app.get("/getUserByPsn", async (req, res) => {
  const userPsn = req.query.psn;

  if (!userPsn) {
    return res.status(400).json({ error: "Missing psn parameter" });
  }

  try {
    const user = await getUserByPsn(userPsn);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user_id: user.user_id });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: "An error occurred", details: error.message });
  }
});

app.get("/getUserStatsHistory", async (req, res) => {
  const userId = req.query.user_id;

  if (!userId) {
    return res.status(400).json({ error: "Missing id parameter" });
  }

  try {
    const stats = await retrieveDailyStats(userId);

    if (!stats) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ ...stats });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: "An error occurred", details: error.message });
  }
});

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname, '..', 'components', 'index.html'));
});

app.get('/obs', function (req, res) {
	res.sendFile(path.join(__dirname, '..', 'components', 'index.html'));
});

app.get('/timer', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'components', 'timer.html'));
});

app.post('/saveUser', async (req, res) => {
  try {
    const user = req.body;
    // Validate the incoming user object
    if (!user || !user.user_id || !user.np_online_id || !user.nick_name) {
      return res.status(400).json({ error: "Invalid user data" });
    }

    // Call the addUser function
    const addedUser = await addUser(user);
    return res.status(201).json(addedUser);

  } catch (error) {
    console.error("Error adding user:", error.message);
    return res.status(500).json({ error: "Failed to add user" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
