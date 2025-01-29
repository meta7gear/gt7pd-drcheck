const fs = require("fs").promises;
const path = require("path");

const usersFilePath = path.join(__dirname, "users.json");

async function getUserByPsn(userPsn) {
  try {
    // Read and parse users.json
    const data = await fs.readFile(usersFilePath, "utf-8");
    const users = JSON.parse(data);

    // Find user by np_online_id
    return users.find((u) => u.np_online_id === userPsn) || null;
  } catch (error) {
    console.error("Error reading users file:", error.message);
    throw new Error("Failed to read user data");
  }
}

module.exports = { getUserByPsn };
