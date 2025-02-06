require('dotenv').config(); // Load environment variables

const express = require("express");
const cors = require("cors");
const { getToken, getStats, getUser } = require("./provider");
const { getUserByPsn } = require("./psnProvider");
const calculateRating = require("../helpers/calculateRating");
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;


app.use(cors());

app.use(express.static(path.join(__dirname, '..', 'public')));

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

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname, '..', 'components', 'index.html'));
});

app.get('/obs', function (req, res) {
	res.sendFile(path.join(__dirname, '..', 'components', 'obs.html'));
});

// app.get('/usersjson', function (req, res) {
//   const filePath = path.join(__dirname, '..', 'components', 'usersjson.json');
//   console.log(filePath);

//   fs.readFile(filePath, 'utf8', (err, data) => {
//     console.log('do readFile');
//       if (err) {
//         console.log('do err');
//           return res.status(500).json({ error: 'Failed to read file' });
//       }

//       try {
//         console.log('do try');
//           const jsonData = JSON.parse(data); // Parse the JSON data
//           res.json(jsonData); // Send the JSON response
//       } catch (parseError) {
//         console.log('do catch');
//           return res.status(500).json({ error: 'Failed to parse JSON' });
//       }
//   });
// });

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
